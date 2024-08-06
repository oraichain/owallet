import { computed, makeObservable, override } from "mobx";
import { DenomHelper, getRpcByChainId, KVStore } from "@owallet/common";
import { QueryError, QueryResponse, QuerySharedContext } from "../../common";
import { CoinPretty, Int } from "@owallet/unit";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../balances";
import { Erc20ContractBalance } from "./types";
import ERC20_ABI from "human-standard-token-abi";
import { ObservableChainQuery } from "../chain-query";
import Web3 from "web3";
import { ChainGetter } from "src/chain";
import { AppCurrency } from "@owallet/types";

export class ObservableQueryErc20BalancesImplParent extends ObservableChainQuery<Erc20ContractBalance> {
  public duplicatedFetchResolver?: Promise<void>;
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly walletAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, contractAddress);
  }

  protected canFetch(): boolean {
    return this.contractAddress?.length !== 0 && this.walletAddress !== "";
  }
  protected async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: Erc20ContractBalance }> {
    const { headers } = await super.fetchResponse(abortController);
    if (!Web3.utils.isAddress(this.walletAddress)) return;
    try {
      const web3 = new Web3(
        getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
      );
      // @ts-ignore
      const contract = new web3.eth.Contract(ERC20_ABI, this.contractAddress);

      const balance = await contract.methods
        .balanceOf(this.walletAddress)
        .call();

      if (!balance) {
        throw new Error("Failed to get the response from the contract");
      }
      const data: Erc20ContractBalance = {
        balance: balance,
      };
      console.log("🚀 ~ ObservableQueryErc20Balance ~ data:", data);

      return {
        data,
        headers,
      };
    } catch (error) {
      console.log("🚀 ~ ObservableQueryErc20Balance ~ error:", error);
    }
  }
}

export class ObservableQueryErc20BalancesImpl
  implements IObservableQueryBalanceImpl
{
  // protected readonly queryErc20Balance: ObservableQueryErc20Balance;

  constructor(
    protected readonly parent: ObservableQueryErc20BalancesImplParent,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly walletAddress: string
  ) {
    // super(
    //   parent,
    //   chainId,
    //   chainGetter,
    //   // No need to set the url at initial.
    //   "",
    //   denomHelper
    // );

    makeObservable(this);

    // this.queryErc20Balance = new ObservableQueryErc20Balance(
    //   kvStore,
    //   chainId,
    //   chainGetter,
    //   denomHelper.contractAddress,
    //   walletAddress
    // );
  }
  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
  }
  // This method doesn't have the role because the fetching is actually exeucnted in the `ObservableQueryErc20Balance`.
  protected canFetch(): boolean {
    return false;
  }
  get error(): Readonly<QueryError<unknown>> | undefined {
    return this.parent.error;
  }
  get isFetching(): boolean {
    return this.parent.isFetching;
  }
  get isObserved(): boolean {
    return this.parent.isObserved;
  }
  get isStarted(): boolean {
    return this.parent.isStarted;
  }
  get response(): Readonly<QueryResponse<Erc20ContractBalance>> | undefined {
    return this.parent.response;
  }
  fetch(): Promise<void> {
    if (!this.parent.duplicatedFetchResolver) {
      this.parent.duplicatedFetchResolver = new Promise<void>(
        (resolve, reject) => {
          (async () => {
            try {
              await this.parent.fetch();
              this.parent.duplicatedFetchResolver = undefined;
              resolve();
            } catch (e) {
              this.parent.duplicatedFetchResolver = undefined;
              reject(e);
            }
          })();
        }
      );
      return this.parent.duplicatedFetchResolver;
    }

    return this.parent.duplicatedFetchResolver;
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find(
      (cur) => cur.coinMinimalDenom === denom
    );

    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.parent.response || !this.parent.response.data.balance) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(this.parent.response.data.balance));
  }
  async waitFreshResponse(): Promise<
    Readonly<QueryResponse<unknown>> | undefined
  > {
    return await this.parent.waitFreshResponse();
  }

  async waitResponse(): Promise<Readonly<QueryResponse<unknown>> | undefined> {
    return await this.parent.waitResponse();
  }
}

export class ObservableQueryErc20BalanceRegistry implements BalanceRegistry {
  // readonly type: BalanceRegistryType = "erc20";
  protected parentMap: Map<string, ObservableQueryErc20BalancesImplParent> =
    new Map();
  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    const key = `${chainId}/${walletAddress}`;
    if (denomHelper.type !== "erc20") return;

    // return new ObservableQueryErc20BalancesImpl(
    //   this.parentMap.get(key)!,
    //   chainId,
    //   chainGetter,
    //   denomHelper,
    //   walletAddress
    // );
    // const key = `${chainId}/${bech32Address}`;

    if (!this.parentMap.has(key)) {
      this.parentMap.set(
        key,
        new ObservableQueryErc20BalancesImplParent(
          this.sharedContext,
          chainId,
          chainGetter,
          denomHelper.contractAddress,
          walletAddress
        )
      );
    }

    return new ObservableQueryErc20BalancesImpl(
      this.parentMap.get(key)!,
      chainId,
      chainGetter,
      denomHelper,
      walletAddress
    );
  }
}
