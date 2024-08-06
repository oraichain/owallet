import {
  addressToPublicKey,
  API,
  ChainIdEnum,
  DenomHelper,
  getOasisNic,
  getRpcByChainId,
  KVStore,
  MapChainIdToNetwork,
  MyBigInt,
  parseRpcBalance,
  urlTxHistory,
  Web3Provider,
} from "@owallet/common";
import {
  CoinPrimitive,
  QueryResponse,
  QuerySharedContext,
} from "../../../common";
import { computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import { StoreUtils } from "../../../common";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../../balances";
import { ObservableChainQuery } from "../../chain-query";
import { Balances } from "./types";
import { CancelToken } from "axios";
import Web3 from "web3";
import { AppCurrency } from "@owallet/types";
import { ChainGetter } from "src/chain";

export class ObservableQueryEvmBalancesImpl
  implements IObservableQueryBalanceImpl
{
  constructor(
    protected readonly parent: ObservableQueryEvmBalancesImplParent,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper // protected readonly nativeBalances: ObservableQueryEvmBalances
  ) {
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return false;
  }

  get isFetching(): boolean {
    return this.parent.isFetching;
  }

  get error() {
    return this.parent.error;
  }

  get response() {
    return this.parent.response;
  }

  get isObserved(): boolean {
    return this.parent.isObserved;
  }
  get isStarted(): boolean {
    return this.parent.isStarted;
  }

  @override
  *fetch() {
    yield this.parent.fetch();
  }
  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
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
  async waitFreshResponse(): Promise<
    Readonly<QueryResponse<unknown>> | undefined
  > {
    return await this.parent.waitFreshResponse();
  }

  async waitResponse(): Promise<Readonly<QueryResponse<unknown>> | undefined> {
    return await this.parent.waitResponse();
  }
}

export class ObservableQueryEvmBalancesImplParent extends ObservableChainQuery<Balances> {
  protected walletAddress: string;

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

  protected async getOasisBalance() {
    try {
      const chainInfo = this.chainGetter.getChain(this._chainId);
      //@ts-ignore
      const nic = getOasisNic(chainInfo.raw.grpc);
      const publicKey = await addressToPublicKey(this.walletAddress);
      const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
      const grpcBalance = parseRpcBalance(account);

      return grpcBalance;
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryEvmBalanceInner ~ getOasisBalance ~ error:",
        error
      );
    }
  }

  protected async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: Balances }> {
    try {
      const { data, headers } = await super.fetchResponse(abortController);
      if (this._chainId === ChainIdEnum.Oasis) {
        const oasisRs = await this.getOasisBalance();
        console.log(oasisRs, "oasis rs");
        const denomNative = this.chainGetter.getChain(this.chainId)
          .stakeCurrency.coinMinimalDenom;
        console.log(denomNative, oasisRs.available, "available kaka");
        const balances: CoinPrimitive[] = [
          {
            amount: oasisRs.available,
            denom: denomNative,
          },
        ];

        const balancesOasis = {
          balances,
        };
        return {
          headers,
          data: balancesOasis,
        };
      }
      const web3 = new Web3(
        getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
      );
      const ethBalance = await web3.eth.getBalance(this.walletAddress);
      console.log(
        "🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ ethBalance:",
        ethBalance
      );
      const denomNative = this.chainGetter.getChain(this.chainId).stakeCurrency
        .coinMinimalDenom;
      const balances: CoinPrimitive[] = [
        {
          amount: ethBalance,
          denom: denomNative,
        },
      ];
      this.fetchAllErc20();
      const balancesEvm = {
        balances,
      };
      return {
        headers,
        data: balancesEvm,
      };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ error:",
        error
      );
    }
  }
  protected async fetchAllErc20() {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    // Attempt to register the denom in the returned response.
    // If it's already registered anyway, it's okay because the method below doesn't do anything.
    // Better to set it as an array all at once to reduce computed.
    if (!MapChainIdToNetwork[chainInfo.chainId]) return;
    const response = await API.getAllBalancesEvm({
      address: this.walletAddress,
      network: MapChainIdToNetwork[chainInfo.chainId],
    });

    if (!response.result) return;
    console.log(response.result, "response.result");
    const allTokensAddress = response.result
      .filter(
        (token) =>
          !!chainInfo.currencies.find(
            (coin) =>
              new DenomHelper(
                coin.coinMinimalDenom
              ).contractAddress?.toLowerCase() !==
              token.tokenAddress?.toLowerCase()
          ) && MapChainIdToNetwork[chainInfo.chainId]
      )
      .map((coin) => {
        console.log(coin, "coin");
        const str = `${
          MapChainIdToNetwork[chainInfo.chainId]
        }%2B${new URLSearchParams(coin.tokenAddress)
          .toString()
          .replace("=", "")}`;
        return str;
      });
    console.log(allTokensAddress, "allTokensAddress");
    if (allTokensAddress?.length === 0) return;

    const tokenInfos = await API.getMultipleTokenInfo({
      tokenAddresses: allTokensAddress.join(","),
    });
    const infoTokens = tokenInfos
      .filter(
        (item, index, self) =>
          index ===
            self.findIndex((t) => t.contractAddress === item.contractAddress) &&
          chainInfo.currencies.findIndex(
            (item2) =>
              new DenomHelper(
                item2.coinMinimalDenom
              ).contractAddress.toLowerCase() ===
              item.contractAddress.toLowerCase()
          ) < 0
      )
      .map((tokeninfo) => {
        const infoToken = {
          coinImageUrl: tokeninfo.imgUrl,
          coinDenom: tokeninfo.abbr,
          coinGeckoId: tokeninfo.coingeckoId,
          coinDecimals: tokeninfo.decimal,
          coinMinimalDenom: `erc20:${tokeninfo.contractAddress}:${tokeninfo.name}`,
          contractAddress: tokeninfo.contractAddress,
        };
        return infoToken;
      });
    console.log(infoTokens, "infoTokens");
    //@ts-ignore
    chainInfo.addCurrencies(...infoTokens);
  }
}

export class ObservableQueryEvmBalanceRegistry implements BalanceRegistry {
  protected parentMap: Map<string, ObservableQueryEvmBalancesImplParent> =
    new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string,
    minimalDenom: string
  ): ObservableQueryEvmBalancesImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);

    if (denomHelper.type !== "native") {
      return;
    }
    //@ts-ignore
    const networkType = chainGetter.getChain(chainId).networkType;
    if (networkType !== "evm") return;
    const key = `evm-${chainId}/${walletAddress}`;

    if (!this.parentMap.has(key)) {
      this.parentMap.set(
        key,
        new ObservableQueryEvmBalancesImplParent(
          this.sharedContext,
          chainId,
          chainGetter,
          walletAddress
        )
      );
    }
    return new ObservableQueryEvmBalancesImpl(
      this.parentMap.get(key),
      chainId,
      chainGetter,
      denomHelper
    );
  }
}
