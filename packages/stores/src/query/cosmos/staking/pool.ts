import { ObservableChainQuery } from "../../chain-query";
import { StakingPool } from "./types";
import { KVStore } from "@owallet/common";
import { ChainGetter, QuerySharedContext } from "../../../common";

export class ObservableQueryStakingPool extends ObservableChainQuery<StakingPool> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "/cosmos/staking/v1beta1/pool");
  }
}
