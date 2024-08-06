import { DenomHelper, getRpcByChainId, KVStore } from "@owallet/common";
import {
  CoinPrimitive,
  QueryError,
  QueryResponse,
  QuerySharedContext,
} from "../../../common";
import { computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import { StoreUtils } from "../../../common";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../../balances";
import { ObservableChainQuery } from "../../chain-query";
import { Balances } from "./types";
import Web3 from "web3";
import { ChainGetter } from "src/chain";
import { AppCurrency } from "@owallet/types";

export class ObservableQueryTronBalancesImpl
  implements IObservableQueryBalanceImpl
{
  constructor(
    protected readonly parent: ObservableQueryTronBalancesImplParent,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper
  ) {
    // super(
    //   kvStore,
    //   chainId,
    //   chainGetter,
    //   // No need to set the url
    //   "",
    //   denomHelper
    // );

    makeObservable(this);
  }

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
  get response(): Readonly<QueryResponse<Balances>> | undefined {
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
    const currency = this.currency;

    if (!this.parent.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return StoreUtils.getBalanceFromCurrency(
      currency,
      this.parent.response.data.balances
    );
  }
  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
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

export class ObservableQueryTronBalancesImplParent extends ObservableChainQuery<Balances> {
  protected walletAddress: string;
  public duplicatedFetchResolver?: Promise<void>;
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "");

    this.walletAddress = walletAddress;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.walletAddress?.length > 0;
  }

  protected async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: Balances }> {
    try {
      const { headers } = await super.fetchResponse(abortController);
      const web3 = new Web3(
        getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
      );
      const ethBalance = await web3.eth.getBalance(this.walletAddress);

      const denomNative = this.chainGetter.getChain(this.chainId).stakeCurrency
        .coinMinimalDenom;
      const balances: CoinPrimitive[] = [
        {
          amount: ethBalance,
          denom: denomNative,
        },
      ];

      const data = {
        balances,
      };
      return {
        headers,
        data,
      };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryTronBalances ~ fetchResponse ~ error:",
        error
      );
    }
  }

  // protected getCacheKey(): string {
  //   return `${this.instance.name}-${this.instance.defaults.baseURL}-balance-evm-native-${this.chainId}-${this.walletAddress}`;
  // }
}

export class ObservableQueryTronBalanceRegistry implements BalanceRegistry {
  protected parentMap: Map<string, ObservableQueryTronBalancesImplParent> =
    new Map();

  // readonly type: BalanceRegistryType = "evm";

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string,
    minimalDenom: string
  ): ObservableQueryTronBalancesImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);

    if (denomHelper.type !== "native") {
      return;
    }
    //@ts-ignore
    const networkType = chainGetter.getChain(chainId).networkType;
    if (networkType !== "evm") return;
    // const key = `tron-${chainId}/${walletAddress}`;

    // if (!this.nativeBalances.has(key)) {
    //   this.nativeBalances.set(
    //     key,
    //     new ObservableQueryTronBalances(
    //       this.kvStore,
    //       chainId,
    //       chainGetter,
    //       walletAddress
    //     )
    //   );
    // }
    // return new ObservableQueryBalanceNative(
    //   this.kvStore,
    //   chainId,
    //   chainGetter,
    //   denomHelper,
    //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //   this.nativeBalances.get(key)!
    // );
    const key = `tron-${chainId}/${walletAddress}`;

    if (!this.parentMap.has(key)) {
      this.parentMap.set(
        key,
        new ObservableQueryTronBalancesImplParent(
          this.sharedContext,
          chainId,
          chainGetter,
          walletAddress
        )
      );
    }

    return new ObservableQueryTronBalancesImpl(
      this.parentMap.get(key)!,
      chainId,
      chainGetter,
      denomHelper
    );
  }
}
