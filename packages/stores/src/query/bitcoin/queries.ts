import { QueriesSetBase } from "../queries";
import { QuerySharedContext } from "../../common";
import { KVStore } from "@owallet/common";
import { DeepReadonly } from "utility-types";
import { OWallet } from "@owallet/types";
import { ObservableQueryBitcoinBalanceRegistry } from "./bitcoin-balance";
import { ObservableQueryBitcoinBalance } from "./bitcoin-query";
// import { QueriesWrappedEvmContract } from "../evm-contract";
import { CosmosQueriesImpl } from "../cosmos";
import { ChainGetter } from "../../chain";

// export interface HasBtcQueries {
//   bitcoin: BitcoinQueries;
// }
export interface BtcQueries {
  bitcoin: BitcoinQueriesImpl;
}

export const BtcQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => BtcQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        bitcoin: new BitcoinQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};
// export class QueriesWrappedBitcoin
//   extends QueriesWrappedEvmContract
//   implements HasBtcQueries
// {
//   public bitcoin: BitcoinQueries;
//
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     apiGetter: () => Promise<OWallet | undefined>
//   ) {
//     super(kvStore, chainId, chainGetter, apiGetter);
//
//     this.bitcoin = new BitcoinQueries(this, kvStore, chainId, chainGetter);
//   }
// }

export class BitcoinQueriesImpl {
  public readonly queryBitcoinBalance: DeepReadonly<ObservableQueryBitcoinBalance>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryBitcoinBalanceRegistry(sharedContext)
    );

    // queryBitcoinBalance, we need to seperate native balance from cosmos as it is default implementation
    // other implementations will require corresponding templates
    this.queryBitcoinBalance = new ObservableQueryBitcoinBalance(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
