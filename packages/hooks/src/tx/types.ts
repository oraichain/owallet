import { AppCurrency, Currency } from "@owallet/types";
import { StdFee } from "@cosmjs/launchpad";
import { CoinPretty } from "@owallet/unit";
import { CoinPrimitive } from "@owallet/stores";

export interface ITxChainSetter {
  chainId: string;
  setChain(chainId: string): void;
}

export interface IMemoConfig extends ITxChainSetter {
  memo: string;
  setMemo(memo: string): void;

  getError(): Error | undefined;
}

export interface IGasConfig extends ITxChainSetter {
  gas: number;
  /*
   The actual gas value from the input.
   */
  gasRaw: string;
  setGas(gas: number | string): void;

  getError(): Error | undefined;
}

export interface IGasEthereumConfig extends ITxChainSetter {
  gas: number;
  /*
   The actual gas value from the input.
   */
  gasRaw: string;
  setGas(gas: number | string): void;

  getError(): Error | undefined;
}

export interface IFeeEthereumConfig extends ITxChainSetter {
  fee: number;
  /*
   The actual gas value from the input.
   */
  feeRaw: string;
  setFee(fee: number | string): void;

  getError(): Error | undefined;
}

export interface IFeeConfig extends ITxChainSetter {
  feeType: FeeType | undefined;
  setFeeType(feeType: FeeType | undefined): void;
  setManualFee(fee: CoinPrimitive | undefined): void;
  feeCurrencies: Currency[];
  feeCurrency: Currency | undefined;
  toStdFee(): StdFee;
  fee: CoinPretty | undefined;
  getFeeTypePretty(feeType: FeeType): CoinPretty;
  getFeePrimitive(): CoinPrimitive | undefined;
  isManual: boolean;
  getError(): Error | undefined;
}
export interface IFeeTronConfig extends ITxChainSetter {
  setManualFee(fee: CoinPrimitive | undefined): void;
  feeCurrencies: Currency[];
  feeCurrency: Currency | undefined;
  fee: CoinPretty | undefined;
  getFeePrimitive(): CoinPrimitive | undefined;
  getError(): Error | undefined;
  toStdFee(): StdFee;
}

export interface IRecipientConfig extends ITxChainSetter {
  recipient: string;
  rawRecipient: string;
  setRawRecipient(recipient: string): void;

  getError(): Error | undefined;
}

export interface IAmountConfig extends ITxChainSetter {
  amount: string;
  setAmount(amount: string): void;
  getAmountPrimitive(): CoinPrimitive;
  sendCurrency: AppCurrency;
  setSendCurrency(currency: AppCurrency | undefined): void;
  sendableCurrencies: AppCurrency[];
  sender: string;
  setSender(sender: string): void;

  /**
   * @deprecated Use `setFraction(1)`
   * @param isMax
   */
  setIsMax(isMax: boolean): void;

  /**
   * @deprecated
   */
  toggleIsMax(): void;

  /**
   * @deprecated Use `fraction === 1`
   */
  isMax: boolean;

  fraction: number | undefined;
  setFraction(value: number | undefined): void;

  getError(): Error | undefined;
}

export const DefaultGasPriceStep: {
  low: number;
  average: number;
  high: number;
} = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};

export type FeeType = "high" | "average" | "low";
