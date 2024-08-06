import { Result } from "./types";
import {
  DenomHelper,
  KVStore,
  MyBigInt,
  getKeyDerivationFromAddressType,
} from "@owallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import {
  QueryError,
  QueryResponse,
  QuerySharedContext,
  StoreUtils,
} from "../../common";
import { action, computed, makeObservable, override } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import { CancelToken } from "axios";
import {
  getAddressTypeByAddress,
  getBaseDerivationPath,
  processBalanceFromUtxos,
} from "@owallet/bitcoin";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../balances";
import { AddressBtcType, AppCurrency, Currency } from "@owallet/types";
import { Bech32Address } from "@owallet/cosmos";
import { ChainGetter } from "src/chain";

export class ObservableQueryBitcoinBalancesImplParent extends ObservableChainQuery<Result> {
  protected bech32Address: string;
  public duplicatedFetchResolver?: Promise<void>;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/address/${bech32Address}/utxo`
    );

    this.bech32Address = bech32Address;

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address?.length > 0;
  }
  protected async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: Result }> {
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
    return { headers, data: btcResult };
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

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(this.response.data.balance));
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

    // try {
    //   Bech32Address.validate(bech32Address);
    // } catch {
    //   return;
    // }

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
