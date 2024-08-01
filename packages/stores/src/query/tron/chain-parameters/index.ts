import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { ChainParameters } from "./types";
import { computed, makeObservable } from "mobx";
import { Int } from "@owallet/unit";

export class ObservableQueryChainParameterTronInner extends ObservableChainQuery<ChainParameters> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, `/api/chainparameters`);

    makeObservable(this);
  }

  @computed
  get bandwidthPrice(): Int {
    if (!this.response?.data?.tronParameters) {
      return new Int(1000);
    }
    const price = this.response.data.tronParameters.find(
      ({ key }) => key === "getTransactionFee"
    );
    if (!price) return new Int(1000);
    return new Int(price.value);
  }
  @computed
  get energyPrice(): Int {
    if (!this.response?.data?.tronParameters) {
      return new Int(420);
    }
    const price = this.response.data.tronParameters.find(
      ({ key }) => key === "getEnergyFee"
    );
    if (!price) return new Int(420);
    return new Int(price.value);
  }
}

export class ObservableQueryChainParameterTron extends ObservableChainQueryMap<ChainParameters> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (walletAddress) => {
      return new ObservableQueryChainParameterTronInner(
        this.kvStore,
        this.chainId,
        this.chainGetter
      );
    });
  }

  getQueryChainParameters(
    walletAddress: string
  ): ObservableQueryChainParameterTronInner {
    return this.get(walletAddress) as ObservableQueryChainParameterTronInner;
  }
}
