import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { getRpcByChainId, KVStore } from "@owallet/common";
import { QueryResponse, QuerySharedContext } from "../../../common";
import { computed, makeObservable } from "mobx";
import Web3 from "web3";

import ERC20_ABI from "human-standard-token-abi";
import { ChainGetter } from "../../../chain";
type GasEvmRequest = {
  to: string;
  from: string;
  amount: string;
  contract_address: string;
};
export class ObservableQueryGasEvmContractInner extends ObservableChainQuery<number> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly paramGas: GasEvmRequest
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
    if (!this.response?.data) {
      //TODO: default gas for eth is 21000
      return 21000;
    }
    return this.response.data;
  }
  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: number }> {
    try {
      const web3 = new Web3(
        getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
      );
      const { from, to, contract_address, amount } = this.paramGas;
      if (!to || !from || !amount || !contract_address) return;
      const tokenInfo = new web3.eth.Contract(
        // @ts-ignore
        ERC20_ABI,
        contract_address
      );
      const estimateGas = await tokenInfo.methods
        .transfer(to, Web3.utils.toWei(amount))
        .estimateGas({
          from: from,
        });
      console.log(
        "🚀 ~ ObservableQueryGasEvmContractInner ~ fetchResponse ~ estimateGas:",
        estimateGas
      );

      return {
        data: estimateGas,
        headers: null,
      };
    } catch (error) {
      console.log(
        "🚀 ~ ObservableQueryGasEvmContractInner ~ fetchResponse ~ error:",
        error
      );
    }
  }
}

export class ObservableQueryGasEvmContract extends ObservableChainQueryMap<number> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (data) => {
      return new ObservableQueryGasEvmContractInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        JSON.parse(data)
      );
    });
  }

  getGas(data: GasEvmRequest): ObservableQueryGasEvmContractInner {
    return this.get(JSON.stringify(data)) as ObservableQueryGasEvmContractInner;
  }
}
