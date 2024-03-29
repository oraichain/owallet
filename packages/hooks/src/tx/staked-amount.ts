import { IAmountConfig } from "./types";
import { TxChainSetter } from "./chain";
import {
  ChainGetter,
  CoinPrimitive,
  ObservableQueryDelegations,
} from "@owallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { AppCurrency } from "@owallet/types";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "./errors";
import { Dec, DecUtils } from "@owallet/unit";
import { useState } from "react";

export class StakedAmountConfig extends TxChainSetter implements IAmountConfig {
  @observable.ref
  protected queryDelegations: ObservableQueryDelegations;

  @observable
  protected _sender: string;

  @observable
  protected _validatorAddress: string;

  @observable
  protected _amount: string;

  @observable
  protected _fraction: number | undefined = undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    queryDelegations: ObservableQueryDelegations,
    initialValidatorAddress: string
  ) {
    super(chainGetter, initialChainId);

    this._sender = sender;
    this.queryDelegations = queryDelegations;
    this._amount = "";
    this._validatorAddress = initialValidatorAddress;

    makeObservable(this);
  }

  @action
  setValidatorAddress(validatorAddress: string) {
    this._validatorAddress = validatorAddress;
  }

  get validatorAddress(): string {
    return this._validatorAddress;
  }

  @action
  setQueryDelegations(queryDelegations: ObservableQueryDelegations) {
    this.queryDelegations = queryDelegations;
  }

  @action
  setSender(sender: string) {
    this._sender = sender;
  }

  @action
  setSendCurrency() {
    // noop
  }

  @action
  setAmount(amount: string) {
    if (amount.startsWith(".")) {
      amount = "0" + amount;
    }

    if (this.isMax) {
      this.setIsMax(false);
    }
    this._amount = amount;
  }

  @action
  setIsMax(isMax: boolean) {
    this._fraction = isMax ? 1 : undefined;
  }

  @action
  toggleIsMax() {
    this.setIsMax(!this.isMax);
  }

  get isMax(): boolean {
    return this._fraction === 1;
  }

  get fraction(): number | undefined {
    return this._fraction;
  }

  @action
  setFraction(value: number | undefined) {
    this._fraction = value;
  }

  get sender(): string {
    return this._sender;
  }

  @computed
  get amount(): string {
    if (this.fraction != null) {
      const result = this.queryDelegations
        .getQueryBech32Address(this.sender)
        .getDelegationTo(this.validatorAddress);

      if (result.toDec().lte(new Dec(0))) {
        return "0";
      }

      return result
        .mul(new Dec(this.fraction))
        .trim(true)
        .locale(false)
        .hideDenom(true)
        .toString();
    }

    return this._amount;
  }

  getAmountPrimitive(): CoinPrimitive {
    const amountStr = this.amount;
    const sendCurrency = this.sendCurrency;

    if (!amountStr) {
      return {
        denom: sendCurrency.coinMinimalDenom,
        amount: "0",
      };
    }

    try {
      return {
        denom: sendCurrency.coinMinimalDenom,
        amount: new Dec(amountStr)
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(sendCurrency.coinDecimals)
          )
          .truncate()
          .toString(),
      };
    } catch {
      return {
        denom: sendCurrency.coinMinimalDenom,
        amount: "0",
      };
    }
  }

  @computed
  get sendCurrency(): AppCurrency {
    return this.chainInfo.stakeCurrency;
  }

  get sendableCurrencies(): AppCurrency[] {
    return [this.chainInfo.stakeCurrency];
  }

  getError(): Error | undefined {
    const sendCurrency = this.sendCurrency;
    if (!sendCurrency) {
      return new Error("Currency to send not set");
    }
    if (this.amount === "") {
      return new EmptyAmountError("Amount is empty");
    }
    if (Number.isNaN(parseFloat(this.amount))) {
      return new InvalidNumberAmountError("Invalid form of number");
    }
    let dec;
    try {
      dec = new Dec(this.amount);
      if (dec.equals(new Dec(0))) {
        return new ZeroAmountError("Amount is zero");
      }
    } catch {
      return new InvalidNumberAmountError("Invalid form of number");
    }
    if (new Dec(this.amount).lt(new Dec(0))) {
      return new NegativeAmountError("Amount is negative");
    }

    const balance = this.queryDelegations
      .getQueryBech32Address(this.sender)
      .getDelegationTo(this.validatorAddress);
    const balanceDec = balance.toDec();
    if (dec.gt(balanceDec)) {
      return new InsufficientAmountError("Insufficient amount");
    }

    return;
  }
}

export const useStakedAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  sender: string,
  queryDelegations: ObservableQueryDelegations,
  validatorAddress: string
) => {
  const [txConfig] = useState(
    () =>
      new StakedAmountConfig(
        chainGetter,
        chainId,
        sender,
        queryDelegations,
        validatorAddress
      )
  );
  txConfig.setChain(chainId);
  txConfig.setQueryDelegations(queryDelegations);
  txConfig.setSender(sender);
  txConfig.setValidatorAddress(validatorAddress);

  return txConfig;
};
