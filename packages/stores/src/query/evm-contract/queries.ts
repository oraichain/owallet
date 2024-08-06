import { QueriesSetBase } from "../queries";
import { QuerySharedContext } from "../../common";
// import { KVStore } from "@owallet/common";
import { ObservableQueryErc20ContractInfo } from "./erc20-contract-info";
import { DeepReadonly } from "utility-types";
import { ObservableQueryErc20BalanceRegistry } from "./erc20-balance";

// import { OWallet } from "@owallet/types";
// import { QueriesWrappedEvm } from "../evm/queries";
import { ObservableQueryGasEvmContract } from "./gas";
import { ChainGetter } from "src/chain";

// export interface HasEvmContractQueries {
//   evmContract: EvmContractQueries;
// }

// export class QueriesWrappedEvmContract
//   extends QueriesWrappedEvm
//   implements HasEvmContractQueries
// {
//   public evmContract: EvmContractQueries;

//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     apiGetter: () => Promise<OWallet | undefined>
//   ) {
//     super(kvStore, chainId, chainGetter, apiGetter);

//     this.evmContract = new EvmContractQueries(
//       this,
//       kvStore,
//       chainId,
//       chainGetter
//     );
//   }
// }

export interface EvmContractQueries {
  evmContract: EvmContractQueriesImpl;
}

export const EvmContractQueries = {
  use(): (
    queriesSetBase: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) => EvmContractQueries {
    return (
      queriesSetBase: QueriesSetBase,
      sharedContext: QuerySharedContext,
      chainId: string,
      chainGetter: ChainGetter
    ) => {
      return {
        evmContract: new EvmContractQueriesImpl(
          queriesSetBase,
          sharedContext,
          chainId,
          chainGetter
        ),
      };
    };
  },
};

export class EvmContractQueriesImpl {
  public readonly queryErc20ContractInfo: DeepReadonly<ObservableQueryErc20ContractInfo>;
  public readonly queryGas: DeepReadonly<ObservableQueryGasEvmContract>;
  constructor(
    base: QueriesSetBase,
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    base.queryBalances.addBalanceRegistry(
      new ObservableQueryErc20BalanceRegistry(sharedContext)
    );

    this.queryErc20ContractInfo = new ObservableQueryErc20ContractInfo(
      sharedContext,
      chainId,
      chainGetter
    );

    this.queryGas = new ObservableQueryGasEvmContract(
      sharedContext,
      chainId,
      chainGetter
    );
  }
}
