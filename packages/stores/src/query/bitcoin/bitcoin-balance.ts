import {
  DenomHelper,
  getKeyDerivationFromAddressType,
  KVStore,
} from "@owallet/common";
import { QueryError, QueryResponse, QuerySharedContext } from "../../common";
import { computed, makeObservable, override } from "mobx";

import { CoinPretty, Int } from "@owallet/unit";
import { StoreUtils } from "../../common";

import { BalanceRegistry, IObservableQueryBalanceImpl } from "../balances";
import { ObservableChainQuery } from "../chain-query";
import { Result } from "./types";
import { AddressBtcType, AppCurrency } from "@owallet/types";
import { ChainGetter } from "../../chain";
import {
  getAddressTypeByAddress,
  getBaseDerivationPath,
  processBalanceFromUtxos,
} from "@owallet/bitcoin/build/helpers";

export class ObservableQueryBitcoinBalancesImplParent extends ObservableChainQuery<Result> {
  // XXX: See comments below.
  //      The reason why this field is here is that I don't know if it's mobx's bug or intention,
  //      but fetch can be executed twice by observation of parent and child by `onBecomeObserved`,
  //      so fetch should not be overridden in this parent class.
  public duplicatedFetchResolver?: Promise<void>;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/address/${bech32Address}/utxo`
    );

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{
    headers: any;
    data: Result;
  }> {
    const { data, headers } = await super.fetchResponse(abortController);
    const addressType = getAddressTypeByAddress(
      this.bech32Address
    ) as AddressBtcType;
    const keyDerivation = getKeyDerivationFromAddressType(addressType);
    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string,
      keyDerivationPath: keyDerivation,
    }) as string;
    const btcResult = processBalanceFromUtxos({
      address: this.bech32Address,
      utxos: data,
      path,
    });
    if (!btcResult) {
      throw new Error("Failed to get the response from bitcoin");
    }
    return {
      data: btcResult,
      headers,
    };
  }
}

export class ObservableQueryBitcoinBalancesImpl
  implements IObservableQueryBalanceImpl
{
  constructor(
    protected readonly parent: ObservableQueryBitcoinBalancesImplParent,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper
  ) {
    makeObservable(this);
  }

  // @computed
  // get balance(): CoinPretty {
  //   const currency = this.currency;
  //
  //   if (!this.response) {
  //     return new CoinPretty(currency, new Int(0)).ready(false);
  //   }
  //
  //   return StoreUtils.getBalanceFromCurrency(
  //     currency,
  //     this.response.data.balances
  //   );
  // }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    if (
      !this.response?.data ||
      !this.response?.data?.balance ||
      currency.coinDenom !== "BTC"
    ) {
      return new CoinPretty(currency, new Int(0));
    }
    return new CoinPretty(currency, new Int(this.response?.data?.balance));
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

  get response(): Readonly<QueryResponse<Result>> | undefined {
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

export class ObservableQueryBitcoinBalanceRegistry implements BalanceRegistry {
  protected parentMap: Map<string, ObservableQueryBitcoinBalancesImplParent> =
    new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBitcoinBalancesImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type !== "native") {
      return;
    }

    const key = `${chainId}/${bech32Address}`;

    if (!this.parentMap.has(key)) {
      this.parentMap.set(
        key,
        new ObservableQueryBitcoinBalancesImplParent(
          this.sharedContext,
          chainId,
          chainGetter,
          bech32Address
        )
      );
    }

    return new ObservableQueryBitcoinBalancesImpl(
      this.parentMap.get(key)!,
      chainId,
      chainGetter,
      denomHelper
    );
  }
}

// import { Result } from "./types";
// import {
//   DenomHelper,
//   KVStore,
//   MyBigInt,
//   getKeyDerivationFromAddressType,
// } from "@owallet/common";
// import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
// import { ChainGetter, QueryResponse, StoreUtils } from "../../common";
// import { action, computed, makeObservable, override } from "mobx";
// import { CoinPretty, Int } from "@owallet/unit";
// import { CancelToken } from "axios";
// import {
//   getAddressTypeByAddress,
//   getBaseDerivationPath,
//   processBalanceFromUtxos,
// } from "@owallet/bitcoin";
// import {
//   BalanceRegistry,
//   BalanceRegistryType,
//   ObservableQueryBalanceInner,
// } from "../balances";
// import { AddressBtcType, Currency } from "@owallet/types";
//
// export class ObservableQueryBtcBalances extends ObservableChainQuery<Result> {
//   protected bech32Address: string;
//
//   protected duplicatedFetchCheck: boolean = false;
//
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     bech32Address: string
//   ) {
//     super(kvStore, chainId, chainGetter, `/address/${bech32Address}/utxo`);
//
//     this.bech32Address = bech32Address;
//
//     makeObservable(this);
//   }
//
//   protected canFetch(): boolean {
//     // If bech32 address is empty, it will always fail, so don't need to fetch it.
//     return this.bech32Address.length > 0;
//   }
//   protected async fetchResponse(
//     cancelToken: CancelToken
//   ): Promise<QueryResponse<Result>> {
//     const resApi = await super.fetchResponse(cancelToken);
//     const addressType = getAddressTypeByAddress(
//       this.bech32Address
//     ) as AddressBtcType;
//     const keyDerivation = getKeyDerivationFromAddressType(addressType);
//     const path = getBaseDerivationPath({
//       selectedCrypto: this.chainId as string,
//       keyDerivationPath: keyDerivation,
//     }) as string;
//     const btcResult = processBalanceFromUtxos({
//       address: this.bech32Address,
//       utxos: resApi.data,
//       path,
//     });
//     if (!btcResult) {
//       throw new Error("Failed to get the response from bitcoin");
//     }
//     return {
//       data: btcResult,
//       status: 1,
//       staled: false,
//       timestamp: Date.now(),
//     };
//   }
// }
// export class ObservableQueryBitcoinBalanceNative extends ObservableQueryBalanceInner {
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     denomHelper: DenomHelper,
//     protected readonly nativeBalances: ObservableQueryBtcBalances
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
//     return true;
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
//     if (
//       !this.nativeBalances.response?.data ||
//       !this.nativeBalances.response?.data?.balance ||
//       currency.coinDenom !== "BTC"
//     ) {
//       return new CoinPretty(currency, new Int(new MyBigInt(0)?.toString()));
//     }
//     return new CoinPretty(
//       currency,
//       new Int(new MyBigInt(this.response?.data?.balance)?.toString())
//     );
//   }
// }
// export class ObservableQueryBitcoinBalanceRegistry implements BalanceRegistry {
//   protected nativeBalances: Map<string, ObservableQueryBtcBalances> = new Map();
//   readonly type: BalanceRegistryType = "bitcoin";
//
//   constructor(protected readonly kvStore: KVStore) {}
//
//   getBalanceInner(
//     chainId: string,
//     chainGetter: ChainGetter,
//     bech32Address: string,
//     minimalDenom: string
//   ): ObservableQueryBalanceInner | undefined {
//     const denomHelper = new DenomHelper(minimalDenom);
//
//     if (denomHelper.type !== "native") {
//       return;
//     }
//
//     const key = `${chainId}/${bech32Address}`;
//     if (!this.nativeBalances.has(key)) {
//       this.nativeBalances.set(
//         key,
//         new ObservableQueryBtcBalances(
//           this.kvStore,
//           chainId,
//           chainGetter,
//           bech32Address
//         )
//       );
//     }
//
//     return new ObservableQueryBitcoinBalanceNative(
//       this.kvStore,
//       chainId,
//       chainGetter,
//       denomHelper,
//       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//       this.nativeBalances.get(key)!
//     );
//   }
// }
