import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainIdEnum, KVStore } from "@owallet/common";
import { QueryResponse, QuerySharedContext } from "../../../common";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Int } from "@owallet/unit";
import Web3 from "web3";
import { ChainGetter } from "src/chain";

type GasRequest = {
  to: string;
  from: string;
};
export class ObservableQueryGasInner extends ObservableChainQuery<number> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly paramGas: GasRequest
  ) {
    super(sharedContext, chainId, chainGetter, ``);
    makeObservable(this);
  }

  /**
   * Return the gas price.
   * If fetching is not completed or failed, return the 0 Int.
   */
  @computed
  get gas(): number {
    if (this.chainId === ChainIdEnum.Oasis) {
      return 0;
    }
    if (!this.response?.data) {
      //TODO: default gas for eth is 21000
      return 21000;
    }
    return this.response.data;
  }
  protected async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: number }> {
    try {
      const { data, headers } = await super.fetchResponse(abortController);
      const web3 = new Web3(this.chainGetter.getChain(this.chainId).rpc);

      if (!this.paramGas.to || !this.paramGas.from) return;
      const estimateGas = await web3.eth.estimateGas({
        to: this.paramGas.to,
        from: this.paramGas.from,
      });

      return {
        headers,
        data: estimateGas,
      };
    } catch (error) {
      throw Error(error);
    }
  }
}

export class ObservableQueryGas extends ObservableChainQueryMap<number> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (data) => {
      return new ObservableQueryGasInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        JSON.parse(data)
      );
    });
  }

  getGas(data: GasRequest): ObservableQueryGasInner {
    return this.get(JSON.stringify(data)) as ObservableQueryGasInner;
  }
}
