import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import {
  AppCurrency,
  Bech32Config,
  BIP44,
  ChainInfo,
  Currency,
  NetworkType,
} from "@owallet/types";

import { ChainIdHelper } from "@owallet/cosmos";
import { DeepReadonly } from "utility-types";
import { AxiosRequestConfig } from "axios";
import { keepAlive } from "mobx-utils";
export interface ChainGetter {
  // Return the chain info matched with chain id.
  // Expect that this method will return the chain info reactively,
  // so it is possible to detect the chain info changed without any additional effort.
  getChain(chainId: string): ChainInfo & {
    raw: ChainInfo;
    readonly chainIdentifier: string;
    readonly embedded: ChainInfo;
    readonly evm:
      | {
          chainId: number;
          rpc: string;
        }
      | undefined;
    hasFeature(feature: string): boolean;
    addUnknownCurrencies(...coinMinimalDenoms: string[]): void;
    findCurrency(coinMinimalDenom: string): AppCurrency | undefined;
    forceFindCurrency(coinMinimalDenom: string): AppCurrency;
  };
}
type CurrencyRegistrar = (
  coinMinimalDenom: string
) => AppCurrency | [AppCurrency | undefined, boolean] | undefined;

export class ChainInfoInner<C extends ChainInfo = ChainInfo>
  implements ChainInfo
{
  @observable.ref
  protected _chainInfo: C;

  @observable.shallow
  protected unknownDenoms: string[] = [];

  @observable.shallow
  protected registeredCurrencies: AppCurrency[] = [];

  /**
   * 위의 unknownDenoms에 값이 들어오면 밑의 배열의 함수를 순차적으로 실행한다.
   * 만약 Currency 반환하면 그 registrar이 그 denom을 처리했다고 판단하고 순회를 멈춘다.
   * 또한 AppCurrency가 아니라 [AppCurrency, boolean]의 튜플을 반활할 수 있는데
   * 튜플을 반활할 경우 뒤의 boolean이 true일 때우(committed)까지 계속 observe한다.
   * IBC 토큰을 처리하는 경우처럼 쿼리가 다 되기 전에 raw한 currency를 반환할 필요가 있는 경우처럼
   * 등록된 currency가 나중에 replace될 수 있는 경우에 사용할 수 있다.
   */
  @observable
  protected currencyRegistrars: CurrencyRegistrar[] = [];

  constructor(chainInfo: C) {
    this._chainInfo = chainInfo;

    makeObservable(this);

    keepAlive(this, "currencyMap");
  }

  protected getCurrencyFromRegistrars(
    coinMinimalDenom: string
  ): [AppCurrency | undefined, boolean] | undefined {
    for (let i = 0; i < this.currencyRegistrars.length; i++) {
      const registrar = this.currencyRegistrars[i];
      const currency = registrar(coinMinimalDenom);
      if (currency) {
        // AppCurrency일 경우
        if ("coinMinimalDenom" in currency) {
          return [currency, true];
        }
        return currency;
      }
    }
    return undefined;
  }
  hasFeature(feature: string): boolean {
    return !!(
      this._chainInfo.features && this._chainInfo.features.includes(feature)
    );
  }
  get embedded(): C {
    return this._chainInfo;
  }
  get evm(): { chainId: number; rpc: string } | undefined {
    //TODO: need check
    // return this._chainInfo.evm;
    return;
  }
  @computed
  get chainIdentifier(): string {
    return ChainIdHelper.parse(this.chainId).identifier;
  }
  /*
   * When you do not know the currency of the corresponding denom, you can use this method to request registration.
   * Do nothing if already registered or attempting to register.
   * For example, an unknown denom appears in the native balance query, or
   * Can be used to request registration of IBC denom.
   */
  @action
  addUnknownCurrencies(...coinMinimalDenoms: string[]) {
    for (const coinMinimalDenom of coinMinimalDenoms) {
      if (this.unknownDenoms.find((denom) => denom === coinMinimalDenom)) {
        continue;
      }

      if (this.currencyMap.has(coinMinimalDenom)) {
        continue;
      }

      this.unknownDenoms.push(coinMinimalDenom);

      const disposer = autorun(() => {
        const registered = this.getCurrencyFromRegistrars(coinMinimalDenom);
        if (registered) {
          const [currency, committed] = registered;
          runInAction(() => {
            if (currency) {
              const index = this.unknownDenoms.findIndex(
                (denom) => denom === coinMinimalDenom
              );
              if (index >= 0) {
                this.unknownDenoms.splice(index, 1);
              }

              this.addOrReplaceCurrency(currency);
            }

            if (committed) {
              disposer();
            }
          });
        } else {
          disposer();
        }
      });
    }
  }

  @action
  registerCurrencyRegistrar(registrar: CurrencyRegistrar): void {
    this.currencyRegistrars.push(registrar);
  }

  @action
  setChainInfo(chainInfo: C) {
    this._chainInfo = chainInfo;
  }

  get raw(): C {
    return this._chainInfo;
  }
  get evmRpc(): string {
    return this._chainInfo.evmRpc;
  }

  get networkType(): NetworkType {
    return this._chainInfo.networkType || "cosmos";
  }

  get chainId(): string {
    return this._chainInfo.chainId;
  }

  get currencies(): AppCurrency[] {
    return this._chainInfo.currencies.concat(this.registeredCurrencies);
  }

  @computed
  get currencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    for (const currency of this.currencies) {
      result.set(currency.coinMinimalDenom, currency);
    }
    return result;
  }

  @action
  addCurrencies(...currencies: AppCurrency[]) {
    const currencyMap = this.currencyMap;
    for (const currency of currencies) {
      if (!currencyMap.has(currency.coinMinimalDenom)) {
        this.registeredCurrencies.push(currency);
      }
    }
  }

  @action
  removeCurrencies(...coinMinimalDenoms: string[]) {
    const map = new Map<string, boolean>();
    for (const coinMinimalDenom of coinMinimalDenoms) {
      map.set(coinMinimalDenom, true);
    }

    this.registeredCurrencies = this.registeredCurrencies.filter(
      (currency) => !map.get(currency.coinMinimalDenom)
    );
  }

  /**
   * Currency를 반환한다.
   * 만약 해당 Currency가 없다면 unknown currency에 추가한다.
   * @param coinMinimalDenom
   */
  findCurrency(coinMinimalDenom: string): AppCurrency | undefined {
    if (this.currencyMap.has(coinMinimalDenom)) {
      return this.currencyMap.get(coinMinimalDenom);
    }
    this.addUnknownCurrencies(coinMinimalDenom);
  }

  /**
   * findCurrency와 비슷하지만 해당하는 currency가 존재하지 않을 경우 raw currency를 반환한다.
   * @param coinMinimalDenom
   */
  forceFindCurrency(coinMinimalDenom: string): AppCurrency {
    const currency = this.findCurrency(coinMinimalDenom);

    if (!currency) {
      return {
        coinMinimalDenom,
        coinDenom: coinMinimalDenom,
        coinDecimals: 0,
      };
    }
    return currency;
  }

  @action
  protected addOrReplaceCurrency(currency: AppCurrency) {
    if (this.currencyMap.has(currency.coinMinimalDenom)) {
      const index = this.registeredCurrencies.findIndex(
        (cur) => cur.coinMinimalDenom === currency.coinMinimalDenom
      );
      if (index >= 0) {
        this.registeredCurrencies.splice(index, 1, currency);
      }
    } else {
      this.registeredCurrencies.push(currency);
    }
  }

  get stakeCurrency(): Currency {
    return this.raw.stakeCurrency;
  }

  get alternativeBIP44s(): BIP44[] | undefined {
    return this.raw.alternativeBIP44s;
  }

  get bech32Config(): Bech32Config {
    return this.raw.bech32Config;
  }
  get beta(): boolean | undefined {
    return this.raw.beta;
  }

  get bip44(): BIP44 {
    return this.raw.bip44;
  }

  get chainName(): string {
    return this.raw.chainName;
  }

  get coinType(): number | undefined {
    return this.raw.coinType;
  }

  get features(): string[] | undefined {
    return this.raw.features;
  }

  get feeCurrencies(): Currency[] {
    return this.raw.feeCurrencies;
  }

  get gasPriceStep():
    | { low: number; average: number; high: number }
    | undefined {
    return this.raw.stakeCurrency.gasPriceStep;
  }

  get rest(): string {
    return this.raw.rest;
  }

  get restConfig(): AxiosRequestConfig | undefined {
    return this.raw.restConfig;
  }

  get rpc(): string {
    return this.raw.rpc;
  }

  get rpcConfig(): AxiosRequestConfig | undefined {
    return this.raw.rpcConfig;
  }
}

export type ChainInfoOverrider<C extends ChainInfo = ChainInfo> = (
  chainInfo: DeepReadonly<C>
) => C;

export class ChainStore<C extends ChainInfo = ChainInfo>
  implements ChainGetter
{
  @observable.ref
  protected _chainInfos!: ChainInfoInner<C>[];

  protected setChainInfoHandlers: ((
    chainInfoInner: ChainInfoInner<C>
  ) => void)[] = [];

  protected _cachedChainInfosMap: Map<string, ChainInfoInner<C>> = new Map();

  constructor(embedChainInfos: C[]) {
    this.setChainInfos(embedChainInfos);

    makeObservable(this);
  }

  get chainInfos(): ChainInfoInner<C>[] {
    return this._chainInfos;
  }

  getChain(chainId: string): ChainInfoInner<C> {
    if (chainId === "" || !chainId) {
      chainId = "Oraichain";
    }
    const chainIdentifier = ChainIdHelper.parse(chainId);

    const find = this.chainInfos.find((info) => {
      return (
        ChainIdHelper.parse(info.chainId).identifier ===
        chainIdentifier.identifier
      );
    });

    if (!find) {
      throw new Error(`Unknown chain info: ${chainId}`);
    }

    return find;
  }

  hasChain(chainId: string): boolean {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    const find = this.chainInfos.find((info) => {
      return (
        ChainIdHelper.parse(info.chainId).identifier ===
        chainIdentifier.identifier
      );
    });

    return find != null;
  }

  addSetChainInfoHandler(handler: (chainInfoInner: ChainInfoInner<C>) => void) {
    this.setChainInfoHandlers.push(handler);

    for (const chainInfo of this.chainInfos) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const cached = this._cachedChainInfosMap.get(chainInfo.chainId)!;
      handler(cached);
    }
  }

  @action
  protected setChainInfos(chainInfos: C[]) {
    const chainInfoInners: ChainInfoInner<C>[] = [];

    for (const chainInfo of chainInfos) {
      if (this._cachedChainInfosMap.has(chainInfo.chainId)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cached = this._cachedChainInfosMap.get(chainInfo.chainId)!;
        cached.setChainInfo(chainInfo);
        chainInfoInners.push(cached);
      } else {
        const chainInfoInner = new ChainInfoInner(chainInfo);
        this._cachedChainInfosMap.set(chainInfo.chainId, chainInfoInner);
        chainInfoInners.push(chainInfoInner);

        for (const handler of this.setChainInfoHandlers) {
          handler(chainInfoInner);
        }
      }
    }

    this._chainInfos = chainInfoInners;
  }
}
