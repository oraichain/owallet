import { computed } from "mobx";
import { DenomHelper } from "@owallet/common";
import { ChainGetter } from "../../chain";
import { CoinPretty, Int } from "@owallet/unit";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../balances";
import { Cw20ContractBalance } from "../cosmwasm/types";
import { ObservableCosmwasmContractChainQuery } from "../cosmwasm/contract-query";
import { QuerySharedContext } from "../../common";
import { AppCurrency } from "@owallet/types";

export class ObservableQueryErc20BalanceImpl
  extends ObservableCosmwasmContractChainQuery<Cw20ContractBalance>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly bech32Address: string
  ) {
    if (denomHelper.type !== "erc20") {
      throw new Error(`Denom helper must be erc20: ${denomHelper.denom}`);
    }
    super(sharedContext, chainId, chainGetter, denomHelper.contractAddress, {
      balance: { address: bech32Address },
    });
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== "";
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find(
      (cur) => cur.coinMinimalDenom === denom
    );

    // TODO: Infer the currency according to its denom (such if denom is `uatom` -> `Atom` with decimal 6)?
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.response || !this.response.data.balance) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(this.response.data.balance));
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
  }
}

export class ObservableQueryErc20BalanceRegistry implements BalanceRegistry {
  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type === "erc20") {
      return new ObservableQueryErc20BalanceImpl(
        this.sharedContext,
        chainId,
        chainGetter,
        denomHelper,
        bech32Address
      );
    }
  }
}

// import { computed, makeObservable, override } from "mobx";
// import { DenomHelper, getRpcByChainId, KVStore } from "@owallet/common";
// import { ChainGetter, QueryResponse } from "../../common";
// import { CoinPretty, Int } from "@owallet/unit";
// import {
//   BalanceRegistry,
//   BalanceRegistryType,
//   ObservableQueryBalanceInner,
// } from "../balances";
// import { Erc20ContractBalance } from "./types";
// import ERC20_ABI from "human-standard-token-abi";
// import { ObservableChainQuery } from "../chain-query";
// import Web3 from "web3";
//
// export class ObservableQueryErc20Balance extends ObservableChainQuery<Erc20ContractBalance> {
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     protected readonly contractAddress: string,
//     protected readonly walletAddress: string
//   ) {
//     super(kvStore, chainId, chainGetter, contractAddress);
//   }
//
//   protected canFetch(): boolean {
//     return this.contractAddress.length !== 0 && this.walletAddress !== "";
//   }
//   protected async fetchResponse(): Promise<
//     QueryResponse<Erc20ContractBalance>
//   > {
//     try {
//       const web3 = new Web3(
//         getRpcByChainId(this.chainGetter.getChain(this.chainId), this.chainId)
//       );
//       // @ts-ignore
//       const contract = new web3.eth.Contract(ERC20_ABI, this.contractAddress);
//
//       const balance = await contract.methods
//         .balanceOf(this.walletAddress)
//         .call();
//
//       if (!balance) {
//         throw new Error("Failed to get the response from the contract");
//       }
//       const data: Erc20ContractBalance = {
//         balance: balance,
//       };
//       console.log("🚀 ~ ObservableQueryErc20Balance ~ data:", data);
//
//       return {
//         data,
//         status: 1,
//         staled: false,
//         timestamp: Date.now(),
//       };
//     } catch (error) {
//       console.log("🚀 ~ ObservableQueryErc20Balance ~ error:", error);
//     }
//   }
// }
//
// export class ObservableQueryErc20BalanceInner extends ObservableQueryBalanceInner {
//   protected readonly queryErc20Balance: ObservableQueryErc20Balance;
//
//   constructor(
//     kvStore: KVStore,
//     chainId: string,
//     chainGetter: ChainGetter,
//     denomHelper: DenomHelper,
//     protected readonly walletAddress: string
//   ) {
//     super(
//       kvStore,
//       chainId,
//       chainGetter,
//       // No need to set the url at initial.
//       "",
//       denomHelper
//     );
//
//     makeObservable(this);
//
//     this.queryErc20Balance = new ObservableQueryErc20Balance(
//       kvStore,
//       chainId,
//       chainGetter,
//       denomHelper.contractAddress,
//       walletAddress
//     );
//   }
//
//   // This method doesn't have the role because the fetching is actually exeucnted in the `ObservableQueryErc20Balance`.
//   protected canFetch(): boolean {
//     return false;
//   }
//
//   @override
//   *fetch() {
//     yield this.queryErc20Balance.fetch();
//   }
//
//   @computed
//   get balance(): CoinPretty {
//     const denom = this.denomHelper.denom;
//
//     const chainInfo = this.chainGetter.getChain(this.chainId);
//     const currency = chainInfo.currencies.find(
//       (cur) => cur.coinMinimalDenom === denom
//     );
//
//     if (!currency) {
//       throw new Error(`Unknown currency: ${denom}`);
//     }
//
//     if (
//       !this.queryErc20Balance.response ||
//       !this.queryErc20Balance.response.data.balance
//     ) {
//       return new CoinPretty(currency, new Int(0)).ready(false);
//     }
//
//     return new CoinPretty(
//       currency,
//       new Int(this.queryErc20Balance.response.data.balance)
//     );
//   }
// }
//
// export class ObservableQueryErc20BalanceRegistry implements BalanceRegistry {
//   readonly type: BalanceRegistryType = "erc20";
//
//   constructor(protected readonly kvStore: KVStore) {}
//
//   getBalanceInner(
//     chainId: string,
//     chainGetter: ChainGetter,
//     walletAddress: string,
//     minimalDenom: string
//   ): ObservableQueryBalanceInner | undefined {
//     const denomHelper = new DenomHelper(minimalDenom);
//
//     if (denomHelper.type === "erc20") {
//       console.log(
//         "🚀 ~ ObservableQueryErc20BalanceRegistry ~ denomHelper:",
//         denomHelper
//       );
//       return new ObservableQueryErc20BalanceInner(
//         this.kvStore,
//         chainId,
//         chainGetter,
//         denomHelper,
//         walletAddress
//       );
//     }
//   }
// }
