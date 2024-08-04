import { CoinPrimitive } from "../../../common";

export type Balances = {
  balances: CoinPrimitive[];
};

export type SpendableBalances = {
  balances: CoinPrimitive[];
  // TODO: Handle pagination?
  // pagination: {};
};
