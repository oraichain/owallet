import { Result } from "./types";
import {
  KVStore,
  MyBigInt,
  getKeyDerivationFromAddressType,
} from "@owallet/common";
import { ObservableChainQuery, ObservableChainQueryMap } from "../chain-query";
import { QueryResponse, QuerySharedContext } from "../../common";
import { computed } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import { CancelToken } from "axios";
import {
  getAddressTypeByAddress,
  getBaseDerivationPath,
} from "@owallet/bitcoin";
import { processBalanceFromUtxos } from "@owallet/bitcoin";
import { AddressBtcType } from "@owallet/types";
import { ChainGetter } from "src/chain";
export class ObservableQueryBitcoinBalanceInner extends ObservableChainQuery<Result> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly address: string
  ) {
    super(sharedContext, chainId, chainGetter, `/address/${address}/utxo`);
  }

  @computed
  get balance() {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!this.response?.data || !this.response?.data?.balance) {
      return new CoinPretty(chainInfo.stakeCurrency, new Int(0));
    }

    return new CoinPretty(
      chainInfo.stakeCurrency,
      new Int(this.response?.data?.balance)
    );
  }

  protected canFetch(): boolean {
    return this.address?.length !== 0;
  }
  protected async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: Result }> {
    const { data, headers } = await super.fetchResponse(abortController);
    const addressType = getAddressTypeByAddress(this.address) as AddressBtcType;
    const keyDerivation = getKeyDerivationFromAddressType(addressType);
    const path = getBaseDerivationPath({
      selectedCrypto: this.chainId as string,
      keyDerivationPath: keyDerivation,
    }) as string;
    const btcResult = processBalanceFromUtxos({
      address: this.address,
      utxos: data,
      path,
    });
    if (!btcResult) {
      throw new Error("Failed to get the response from bitcoin");
    }
    return {
      headers,
      data: btcResult,
    };
  }
}

export class ObservableQueryBitcoinBalance extends ObservableChainQueryMap<Result> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (address: string) => {
      return new ObservableQueryBitcoinBalanceInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        address
      );
    });
  }

  getQueryBalance(address: string): ObservableQueryBitcoinBalanceInner {
    if (!address) return null;
    return this.get(address) as ObservableQueryBitcoinBalanceInner;
  }
}
