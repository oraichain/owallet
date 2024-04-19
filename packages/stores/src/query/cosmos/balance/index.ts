import { DenomHelper, KVStore } from "@owallet/common";
import { QueryError, QueryResponse, QuerySharedContext } from "../../../common";
import { computed, makeObservable, override } from "mobx";

import { CoinPretty, Int } from "@owallet/unit";
import { StoreUtils } from "../../../common";

import { BalanceRegistry, IObservableQueryBalanceImpl } from "../../balances";
import { ObservableChainQuery } from "../../chain-query";
import { Balances } from "./types";
import { AppCurrency } from "@owallet/types";
import { ChainGetter } from "../../../chain";

export class ObservableQueryCosmosBalancesImplParent extends ObservableChainQuery<Balances> {
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
      `/cosmos/bank/v1beta1/balances/${bech32Address}?pagination.limit=1000`
    );

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<Balances>>
  ) {
    super.onReceiveResponse(response);

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const denoms = response.data.balances.map((coin) => coin.denom);
    chainInfo.addUnknownCurrencies(...denoms);
  }
}

export class ObservableQueryCosmosBalancesImpl
  implements IObservableQueryBalanceImpl
{
  constructor(
    protected readonly parent: ObservableQueryCosmosBalancesImplParent,
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
    // XXX: The balances of cosmos-sdk can share the result of one endpoint.
    //      This class is implemented for this optimization.
    //      But the problem is that the query store can't handle these process properly right now.
    //      Currently, this is the only use-case,
    //      so We'll manually implement this here.
    //      In the case of fetch(), even if it is executed multiple times,
    //      the actual logic should be processed only once.
    //      So some sort of debouncing is needed.
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

export class ObservableQueryCosmosBalanceRegistry implements BalanceRegistry {
  protected parentMap: Map<string, ObservableQueryCosmosBalancesImplParent> =
    new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryCosmosBalancesImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type !== "native") {
      return;
    }

    const key = `${chainId}/${bech32Address}`;

    if (!this.parentMap.has(key)) {
      this.parentMap.set(
        key,
        new ObservableQueryCosmosBalancesImplParent(
          this.sharedContext,
          chainId,
          chainGetter,
          bech32Address
        )
      );
    }

    return new ObservableQueryCosmosBalancesImpl(
      this.parentMap.get(key)!,
      chainId,
      chainGetter,
      denomHelper
    );
  }
}
//
// export class ObservableQueryBalanceNative extends ObservableQueryBalanceInner {
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     denomHelper: DenomHelper,
//     protected readonly nativeBalances: ObservableQueryCosmosBalances
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
// export class ObservableQueryCosmosBalances extends ObservableChainQuery<Balances> {
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
//     super(
//       kvStore,
//       chainId,
//       chainGetter,
//       `/cosmos/bank/v1beta1/balances/${bech32Address}?pagination.limit=1000`
//     );
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
//
//   @override
//   *fetch() {
//     if (!this.duplicatedFetchCheck) {
//       // Because the native "bank" module's balance shares the querying result,
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
//
//   protected setResponse(response: Readonly<QueryResponse<Balances>>) {
//     super.setResponse(response);
//
//     const chainInfo = this.chainGetter.getChain(this.chainId);
//     // Attempt to register the denom in the returned response.
//     // If it's already registered anyway, it's okay because the method below doesn't do anything.
//     // Better to set it as an array all at once to reduce computed.
//     const denoms = response.data.balances.map((coin) => coin.denom);
//     chainInfo.addUnknownCurrencies(...denoms);
//   }
// }
//
// export class ObservableQueryCosmosBalanceRegistry implements BalanceRegistry {
//   protected nativeBalances: Map<string, ObservableQueryCosmosBalances> =
//     new Map();
//
//   readonly type: BalanceRegistryType = "cosmos";
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
//     if (denomHelper.type !== "native") {
//       return;
//     }
//     const networkType = chainGetter.getChain(chainId).networkType;
//     if (networkType !== "cosmos") return;
//     const key = `${chainId}/${bech32Address}`;
//
//     if (!this.nativeBalances.has(key)) {
//       this.nativeBalances.set(
//         key,
//         new ObservableQueryCosmosBalances(
//           this.kvStore,
//           chainId,
//           chainGetter,
//           bech32Address
//         )
//       );
//     }
//
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
