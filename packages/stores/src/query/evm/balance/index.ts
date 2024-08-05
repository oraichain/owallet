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
import { ChainGetter, CoinPrimitive, QueryResponse } from "../../../common";
import { computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import { StoreUtils } from "../../../common";
import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../../balances";
import { ObservableChainQuery } from "../../chain-query";
import { Balances } from "./types";
import { CancelToken } from "axios";
import Web3 from "web3";

export class ObservableQueryBalanceNative extends ObservableQueryBalanceInner {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly nativeBalances: ObservableQueryEvmBalances
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      // No need to set the url
      "",
      denomHelper
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return false;
  }

  get isFetching(): boolean {
    return this.nativeBalances.isFetching;
  }

  get error() {
    return this.nativeBalances.error;
  }

  get response() {
    return this.nativeBalances.response;
  }

  @override
  *fetch() {
    yield this.nativeBalances.fetch();
  }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.nativeBalances.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return StoreUtils.getBalanceFromCurrency(
      currency,
      this.nativeBalances.response.data.balances
    );
  }
}

export class ObservableQueryEvmBalances extends ObservableChainQuery<Balances> {
  protected walletAddress: string;

  protected duplicatedFetchCheck: boolean = false;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string
  ) {
    super(kvStore, chainId, chainGetter, "", null);

    this.walletAddress = walletAddress;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.walletAddress?.length > 0;
  }

  @override
  *fetch() {
    if (!this.duplicatedFetchCheck) {
      // it is inefficient to fetching duplicately in the same loop.
      // So, if the fetching requests are in the same tick, this prevent to refetch the result and use the prior fetching.
      this.duplicatedFetchCheck = true;
      setTimeout(() => {
        this.duplicatedFetchCheck = false;
      }, 1);

      yield super.fetch();
    }
  }
  protected async getOasisBalance() {
    try {
      const chainInfo = this.chainGetter.getChain(this._chainId);
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
  // protected async fetchResponse(response: Readonly<QueryResponse<Balances>>) {
  //   super.setResponse(balances as any);
  //
  //     // const denoms = response.data.balances.map((coin) => coin.denom);
  //     // chainInfo.addUnknownCurrencies(...denoms);
  //   });
  //   // try {
  //   //   if (this._chainId === ChainIdEnum.Oasis) {
  //   //     const oasisRs = await this.getOasisBalance();
  //   //     const denomNative = this.chainGetter.getChain(this.chainId)
  //   //       .stakeCurrency.coinMinimalDenom;
  //   //     const balances: CoinPrimitive[] = [
  //   //       {
  //   //         amount: oasisRs.available,
  //   //         denom: denomNative,
  //   //       },
  //   //     ];

  //   //     const data = {
  //   //       balances,
  //   //     };
  //   //     return {
  //   //       status: 1,
  //   //       staled: false,
  //   //       data,
  //   //       timestamp: Date.now(),
  //   //     };
  //   //   }
  //   //   const web3 = new Web3(
  //   //     getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
  //   //   );
  //   //   const ethBalance = await web3.eth.getBalance(this.walletAddress);
  //   //   console.log(
  //   //     "🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ ethBalance:",
  //   //     ethBalance
  //   //   );
  //   //   const denomNative = this.chainGetter.getChain(this.chainId).stakeCurrency
  //   //     .coinMinimalDenom;
  //   //   const balances: CoinPrimitive[] = [
  //   //     {
  //   //       amount: ethBalance,
  //   //       denom: denomNative,
  //   //     },
  //   //   ];

  //   //   const data = {
  //   //     balances,
  //   //   };
  //   //   console.log(data,"data");
  //   //   return {
  //   //     status: 1,
  //   //     staled: false,
  //   //     data,
  //   //     timestamp: Date.now(),
  //   //   };
  //   // } catch (error) {
  //   //   console.log(
  //   //     "🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ error:",
  //   //     error
  //   //   );
  //   // }
  // }
  protected async fetchResponse(): Promise<QueryResponse<Balances>> {
    try {
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

        const data = {
          balances,
        };
        return {
          status: 1,
          staled: false,
          data,
          timestamp: Date.now(),
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
      const data = {
        balances,
      };
      return {
        status: 1,
        staled: false,
        data,
        timestamp: Date.now(),
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
  protected getCacheKey(): string {
    return `${this.instance.name}-${this.instance.defaults.baseURL}-balance-evm-native-${this.chainId}-${this.walletAddress}`;
  }
}

export class ObservableQueryEvmBalanceRegistry implements BalanceRegistry {
  protected nativeBalances: Map<string, ObservableQueryEvmBalances> = new Map();

  readonly type: BalanceRegistryType = "evm";

  constructor(protected readonly kvStore: KVStore) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    walletAddress: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    console.log(
      "🚀 ~ ObservableQueryEvmBalanceRegistry ~ denomHelper.type:",
      minimalDenom,
      denomHelper.type
    );
    if (denomHelper.type !== "native") {
      return;
    }
    const networkType = chainGetter.getChain(chainId).networkType;
    if (networkType !== "evm") return;
    const key = `evm-${chainId}/${walletAddress}`;

    if (!this.nativeBalances.has(key)) {
      this.nativeBalances.set(
        key,
        new ObservableQueryEvmBalances(
          this.kvStore,
          chainId,
          chainGetter,
          walletAddress
        )
      );
    }
    return new ObservableQueryBalanceNative(
      this.kvStore,
      chainId,
      chainGetter,
      denomHelper,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.nativeBalances.get(key)!
    );
  }
}
