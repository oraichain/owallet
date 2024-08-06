import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";

import { QuerySharedContext } from "../../../common";
import { computed, makeObservable } from "mobx";
import { Int } from "@owallet/unit";

import Web3 from "web3";
import { ChainGetter } from "src/chain";

export class ObservableQueryGasPriceInner extends ObservableChainQuery<string> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, ``);

    makeObservable(this);
  }

  /**
   * Return the gas price.
   * If fetching is not completed or failed, return the 0 Int.
   */
  @computed
  get gasPrice(): Int {
    if (!this.response) {
      return new Int("0");
    }

    return new Int(this.response.data);
  }
  protected async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: string }> {
    try {
      const { data, headers } = await super.fetchResponse(abortController);
      const web3 = new Web3(this.chainGetter.getChain(this.chainId).rpc);
      const gasPrice = await web3.eth.getGasPrice();
      return { headers, data: gasPrice };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryGasPriceInner ~ fetchResponse ~ error:",
        error
      );
    }

    // console.log("🚀 ~ ObservableQueryGasPriceInner ~ fetchResponse ~ gasPrice:", gasPrice)
  }
}

export class ObservableQueryGasPrice extends ObservableChainQueryMap<string> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, () => {
      return new ObservableQueryGasPriceInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter
      );
    });
  }

  getGasPrice(): ObservableQueryGasPriceInner {
    return this.get(this.chainId) as ObservableQueryGasPriceInner;
  }
}
