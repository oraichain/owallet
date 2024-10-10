import { ObservableChainQuery } from "../../chain-query";
import { computed, makeObservable } from "mobx";
import { BaseFee } from "./types";
import { ChainGetter, QuerySharedContext } from "../../../common";
import { Dec } from "@owallet/unit";

export class ObservableQueryBaseFee extends ObservableChainQuery<BaseFee> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/osmosis/txfees/v1beta1/cur_eip_base_fee"
    );

    makeObservable(this);
  }

  get baseFeeAmount(): string {
    return this.response?.data.base_fee ?? "";
  }

  @computed
  get baseFee(): Dec | undefined {
    if (!this.response?.data.base_fee) {
      return undefined;
    }

    return new Dec(this.response.data.base_fee);
  }
}
