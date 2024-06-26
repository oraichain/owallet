import { AmountConfig, IFeeConfig } from "../tx";
import { ChainGetter } from "@owallet/stores";
import { ObservableQueryBalances } from "@owallet/stores";
import { AppCurrency } from "@owallet/types";
import { computed, makeObservable } from "mobx";
import { DenomHelper } from "@owallet/common";
import { useState } from "react";

export class IBCAmountConfig extends AmountConfig {
  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    feeConfig: IFeeConfig | undefined,
    queryBalances: ObservableQueryBalances
  ) {
    super(chainGetter, initialChainId, sender, feeConfig, queryBalances);

    makeObservable(this);
  }

  @computed
  get sendableCurrencies(): AppCurrency[] {
    // Only native currencies can be sent by IBC transfer.
    return super.sendableCurrencies.filter(
      (cur) => new DenomHelper(cur.coinMinimalDenom).type === "native"
    );
  }
}

export const useIBCAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  queryBalances: ObservableQueryBalances
) => {
  const [txConfig] = useState(
    () =>
      new IBCAmountConfig(
        chainGetter,
        chainId,
        sender,
        undefined,
        queryBalances
      )
  );
  txConfig.setChain(chainId);
  txConfig.setQueryBalances(queryBalances);
  txConfig.setSender(sender);

  return txConfig;
};
