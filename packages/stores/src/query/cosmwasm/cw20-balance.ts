import { computed, makeObservable, override } from "mobx";
import { DenomHelper, KVStore } from "@owallet/common";
import { ChainGetter } from "../../common";
import { CoinPretty, Int } from "@owallet/unit";
import {
  BalanceRegistry,
  BalanceRegistryType,
  ObservableQueryBalanceInner,
} from "../balances";
import { Cw20ContractBalance } from "./types";
import { ObservableCosmwasmContractChainQuery } from "./contract-query";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryCw20Balance extends ObservableCosmwasmContractChainQuery<Cw20ContractBalance> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly bech32Address: string
  ) {
    super(sharedContext, chainId, chainGetter, contractAddress, {
      balance: { address: bech32Address },
    });
  }

  protected canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== "";
  }
}

export class ObservableQueryCw20BalanceInner extends ObservableQueryBalanceInner {
  protected readonly queryCw20Balance: ObservableQueryCw20Balance;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      // No need to set the url at initial.
      "",
      denomHelper
    );

    makeObservable(this);

    this.queryCw20Balance = new ObservableQueryCw20Balance(
      sharedContext,
      chainId,
      chainGetter,
      denomHelper.contractAddress,
      bech32Address
    );
  }

  // This method doesn't have the role because the fetching is actually exeucnted in the `ObservableQueryCw20Balance`.
  protected canFetch(): boolean {
    return false;
  }

  @override
  *fetch() {
    yield this.queryCw20Balance.fetch();
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

    if (
      !this.queryCw20Balance.response ||
      !this.queryCw20Balance.response.data.balance
    ) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(
      currency,
      new Int(this.queryCw20Balance.response.data.balance)
    );
  }
}

export class ObservableQueryCw20BalanceRegistry implements BalanceRegistry {
  readonly type: BalanceRegistryType = "cw20";

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type === "cw20") {
      return new ObservableQueryCw20BalanceInner(
        this.sharedContext,
        chainId,
        chainGetter,
        denomHelper,
        bech32Address
      );
    }
  }
}
