import { ChainGetter } from "../../../../common";
import { ObservableChainQuery } from "../../../chain-query";
import { MintParmas } from "./types";
import { KVStore } from "@owallet/common";
import { computed, makeObservable } from "mobx";
import { Dec } from "@owallet/unit";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryOsmosisMintParmas extends ObservableChainQuery<MintParmas> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, `/osmosis/mint/v1beta1/params`);

    makeObservable(this);
  }

  get mintDenom(): string | undefined {
    return this.response?.data.params.mint_denom;
  }

  get epochIdentifier(): string | undefined {
    return this.response?.data.params.epoch_identifier;
  }

  @computed
  get distributionProportions(): {
    staking: Dec;
    poolIncentives: Dec;
    developerRewards: Dec;
  } {
    if (!this.response) {
      return {
        staking: new Dec(0),
        poolIncentives: new Dec(0),
        developerRewards: new Dec(0),
      };
    }

    return {
      staking: new Dec(
        this.response.data.params.distribution_proportions.staking
      ),
      poolIncentives: new Dec(
        this.response.data.params.distribution_proportions.pool_incentives
      ),
      developerRewards: new Dec(
        this.response.data.params.distribution_proportions.developer_rewards
      ),
    };
  }
}
