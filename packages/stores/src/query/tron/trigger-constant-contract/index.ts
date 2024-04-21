import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
// import { KVStore } from "@owallet/common";
import { QuerySharedContext } from "../../../common";
import {
  ITriggerConstantContract,
  ITriggerConstantContractReq,
  Transaction,
} from "./types";
import { computed, makeObservable } from "mobx";
import { Int } from "@owallet/unit";
import { ChainGetter } from "../../../chain";
import { simpleFetch } from "@owallet/simple-fetch";

export class ObservableQueryTriggerConstantContractInner extends ObservableChainQuery<ITriggerConstantContract> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly data: ITriggerConstantContractReq
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/walletsolidity/triggerconstantcontract`
      // data,
      // chainGetter.getChain(chainId).rpc
    );
    makeObservable(this);
  }
  @computed
  get energyEstimate(): Int {
    if (!this.response?.data?.energy_used) {
      return new Int(0);
    }
    return new Int(this.response.data.energy_used);
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{
    headers: any;
    data: ITriggerConstantContract;
  }> {
    const result = await simpleFetch<ITriggerConstantContract>(
      this.baseURL,
      this.url,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(this.data),
        signal: abortController.signal,
      }
    );

    // if (result.data.result && result.data.error.message) {
    //   throw new Error(result.data.error.message);
    // }

    if (!result.data) {
      throw new Error("Unknown error");
    }
    console.log(result.data, "result.data");
    return {
      headers: result.headers,
      data: result.data,
    };
  }

  @computed
  get transaction(): Transaction {
    if (!this.response?.data?.transaction) {
      return;
    }
    return this.response.data.transaction;
  }
}

export class ObservableQueryTriggerConstantContract extends ObservableChainQueryMap<ITriggerConstantContract> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (data) => {
      const triggerConstantContract = JSON.parse(data);
      return new ObservableQueryTriggerConstantContractInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        triggerConstantContract
      );
    });
  }

  queryTriggerConstantContract(
    data: ITriggerConstantContractReq
  ): ObservableQueryTriggerConstantContractInner {
    return this.get(
      JSON.stringify(data)
    ) as ObservableQueryTriggerConstantContractInner;
  }
}
