import { QueriesSetBase } from "../queries";
import { QuerySharedContext } from "../../common";
import { KVStore } from "@owallet/common";
// import { QueriesWrappedCosmwasm } from "../cosmwasm";
import { OWallet } from "@owallet/types";
import { ObservableQueryEvmBalanceRegistry } from "./balance";
import { DeepReadonly } from "utility-types";
import { ObservableQueryGasPrice } from "./gas-price";
import { ObservableQueryGas } from "./gas";

import { ChainGetter } from "src/chain";

// export interface HasEvmQueries {
//   evm: EvmQueries;
// }

// export class QueriesWrappedEvm
//   extends QueriesWrappedCosmwasm
//   implements HasEvmQueries
// {
//   public evm: EvmQueries;

//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     apiGetter: () => Promise<OWallet | undefined>
//   ) {
//     super(kvStore, chainId, chainGetter, apiGetter);

//     this.evm = new EvmQueries(this, kvStore, chainId, chainGetter);
//   }
// }

export interface EvmQueries {
  evm: EvmQueriesImpl;
}

export const EvmQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => EvmQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        evm: new EvmQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class EvmQueriesImpl {
  public readonly queryGasPrice: DeepReadonly<ObservableQueryGasPrice>;
  public readonly queryGas: DeepReadonly<ObservableQueryGas>;

  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryEvmBalanceRegistry(sharedContext)
    );
    this.queryGasPrice = new ObservableQueryGasPrice(
      sharedContext,
      chainId,
      chainGetter
    );
    this.queryGas = new ObservableQueryGas(sharedContext, chainId, chainGetter);
  }
}
