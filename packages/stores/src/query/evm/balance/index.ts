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
import { AppCurrency } from "@owallet/types";
import { ChainGetter } from "../../../chain";
import Web3 from "web3";

export class ObservableQueryEvmBalancesImplParent extends ObservableChainQuery<Balances> {
  // XXX: See comments below.
  //      The reason why this field is here is that I don't know if it's mobx's bug or intention,
  //      but fetch can be executed twice by observation of parent and child by `onBecomeObserved`,
  //      so fetch should not be overridden in this parent class.
  public duplicatedFetchResolver?: Promise<void>;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly walletAddress: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      // No need to set the url
      ""
    );

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.walletAddress.length > 0;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: Balances }> {
    try {
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
        data,
        headers: null,
      };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ error:",
        error
      );
    }
  }
}

export class ObservableQueryEvmBalancesImpl
  implements IObservableQueryBalanceImpl
{
  constructor(
    protected readonly parent: ObservableQueryEvmBalancesImplParent,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper
  ) {
    makeObservable(this);
  }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return StoreUtils.getBalanceFromCurrency(
      currency,
      this.response.data.balances
    );
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
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

  async waitFreshResponse(): Promise<
    Readonly<QueryResponse<unknown>> | undefined
  > {
    return await this.parent.waitFreshResponse();
  }

  async waitResponse(): Promise<Readonly<QueryResponse<unknown>> | undefined> {
    return await this.parent.waitResponse();
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
    const networkType = chainGetter.getChain(chainId).networkType;
    if (networkType !== "evm") return;
    const key = `${chainId}/${walletAddress}`;

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
      this.parentMap.get(key)!,
      chainId,
      chainGetter,
      denomHelper
    );
  }
}

// import {
//   addressToPublicKey,
//   ChainIdEnum,
//   DenomHelper,
//   getOasisNic,
//   getRpcByChainId,
//   KVStore,
//   MyBigInt,
//   parseRpcBalance,
//   Web3Provider,
// } from "@owallet/common";
// import { ChainGetter, CoinPrimitive, QueryResponse } from "../../../common";
// import { computed, makeObservable, override } from "mobx";
// import { CoinPretty, Int } from "@owallet/unit";
// import { StoreUtils } from "../../../common";
// import {
//   BalanceRegistry,
//   BalanceRegistryType,
//   ObservableQueryBalanceInner,
// } from "../../balances";
// import { ObservableChainQuery } from "../../chain-query";
// import { Balances } from "./types";
// import { CancelToken } from "axios";
// import Web3 from "web3";
//
// export class ObservableQueryBalanceNative extends ObservableQueryBalanceInner {
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     denomHelper: DenomHelper,
//     protected readonly nativeBalances: ObservableQueryEvmBalances
//   ) {
//     super(
//       kvStore,
//       chainId,
//       chainGetter,
//       // No need to set the url
//       "",
//       denomHelper
//     );
//
//     makeObservable(this);
//   }
//
//   protected canFetch(): boolean {
//     return false;
//   }
//
//   get isFetching(): boolean {
//     return this.nativeBalances.isFetching;
//   }
//
//   get error() {
//     return this.nativeBalances.error;
//   }
//
//   get response() {
//     return this.nativeBalances.response;
//   }
//
//   @override
//   *fetch() {
//     yield this.nativeBalances.fetch();
//   }
//
//   @computed
//   get balance(): CoinPretty {
//     const currency = this.currency;
//
//     if (!this.nativeBalances.response) {
//       return new CoinPretty(currency, new Int(0)).ready(false);
//     }
//
//     return StoreUtils.getBalanceFromCurrency(
//       currency,
//       this.nativeBalances.response.data.balances
//     );
//   }
// }
//
// export class ObservableQueryEvmBalances extends ObservableChainQuery<Balances> {
//   protected walletAddress: string;
//
//   protected duplicatedFetchCheck: boolean = false;
//
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     walletAddress: string
//   ) {
//     super(kvStore, chainId, chainGetter, "");
//
//     this.walletAddress = walletAddress;
//
//     makeObservable(this);
//   }
//
//   protected canFetch(): boolean {
//     // If bech32 address is empty, it will always fail, so don't need to fetch it.
//     return this.walletAddress.length > 0;
//   }
//
//   @override
//   *fetch() {
//     if (!this.duplicatedFetchCheck) {
//       // it is inefficient to fetching duplicately in the same loop.
//       // So, if the fetching requests are in the same tick, this prevent to refetch the result and use the prior fetching.
//       this.duplicatedFetchCheck = true;
//       setTimeout(() => {
//         this.duplicatedFetchCheck = false;
//       }, 1);
//
//       yield super.fetch();
//     }
//   }
//   protected async getOasisBalance() {
//     try {
//       const chainInfo = this.chainGetter.getChain(this._chainId);
//       const nic = getOasisNic(chainInfo.raw.grpc);
//       const publicKey = await addressToPublicKey(this.walletAddress);
//       const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
//       const grpcBalance = parseRpcBalance(account);
//
//       return grpcBalance;
//     } catch (error) {
//       console.log(
//         "🚀 ~ ObservableQueryEvmBalanceInner ~ getOasisBalance ~ error:",
//         error
//       );
//     }
//   }
//   protected async fetchResponse(): Promise<QueryResponse<Balances>> {
//     try {
//       if (this._chainId === ChainIdEnum.Oasis) {
//         const oasisRs = await this.getOasisBalance();
//         console.log(oasisRs, "oasis rs");
//         const denomNative = this.chainGetter.getChain(this.chainId)
//           .stakeCurrency.coinMinimalDenom;
//         console.log(denomNative, oasisRs.available, "available kaka");
//         const balances: CoinPrimitive[] = [
//           {
//             amount: oasisRs.available,
//             denom: denomNative,
//           },
//         ];
//
//         const data = {
//           balances,
//         };
//         return {
//           status: 1,
//           staled: false,
//           data,
//           timestamp: Date.now(),
//         };
//       }
//       const web3 = new Web3(
//         getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
//       );
//       const ethBalance = await web3.eth.getBalance(this.walletAddress);
//       console.log(
//         "🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ ethBalance:",
//         ethBalance
//       );
//       const denomNative = this.chainGetter.getChain(this.chainId).stakeCurrency
//         .coinMinimalDenom;
//       const balances: CoinPrimitive[] = [
//         {
//           amount: ethBalance,
//           denom: denomNative,
//         },
//       ];
//
//       const data = {
//         balances,
//       };
//       return {
//         status: 1,
//         staled: false,
//         data,
//         timestamp: Date.now(),
//       };
//     } catch (error) {
//       console.log(
//         "🚀 ~ ObservableQueryEvmBalances ~ fetchResponse ~ error:",
//         error
//       );
//     }
//   }
//   protected getCacheKey(): string {
//     return `${this.instance.name}-${this.instance.defaults.baseURL}-balance-evm-native-${this.chainId}-${this.walletAddress}`;
//   }
// }
//
// export class ObservableQueryEvmBalanceRegistry implements BalanceRegistry {
//   protected nativeBalances: Map<string, ObservableQueryEvmBalances> = new Map();
//
//   readonly type: BalanceRegistryType = "evm";
//
//   constructor(protected readonly kvStore: KVStore) {}
//
//   getBalanceInner(
//     chainId: string,
//     chainGetter: ChainGetter,
//     walletAddress: string,
//     minimalDenom: string
//   ): ObservableQueryBalanceInner | undefined {
//     const denomHelper = new DenomHelper(minimalDenom);
//     console.log(
//       "🚀 ~ ObservableQueryEvmBalanceRegistry ~ denomHelper.type:",
//       minimalDenom,
//       denomHelper.type
//     );
//     if (denomHelper.type !== "native") {
//       return;
//     }
//     const networkType = chainGetter.getChain(chainId).networkType;
//     if (networkType !== "evm") return;
//     const key = `evm-${chainId}/${walletAddress}`;
//
//     if (!this.nativeBalances.has(key)) {
//       this.nativeBalances.set(
//         key,
//         new ObservableQueryEvmBalances(
//           this.kvStore,
//           chainId,
//           chainGetter,
//           walletAddress
//         )
//       );
//     }
//     return new ObservableQueryBalanceNative(
//       this.kvStore,
//       chainId,
//       chainGetter,
//       denomHelper,
//       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//       this.nativeBalances.get(key)!
//     );
//   }
// }
