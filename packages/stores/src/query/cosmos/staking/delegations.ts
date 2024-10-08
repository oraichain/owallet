import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Delegation, Delegations, DelegationsStargate } from "./types";
import { KVStore } from "@owallet/common";
import { ChainGetter } from "../../../common";
import { CoinPretty, Int } from "@owallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryDelegationsInner extends ObservableChainQuery<
  Delegations | DelegationsStargate
> {
  protected bech32Address: string;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/staking/v1beta1/delegations/${bech32Address}?pagination.limit=1000`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address?.length > 0;
  }

  @computed
  get total(): CoinPretty {
    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!this.response) {
      return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
    }

    let totalBalance = new Int(0);
    for (const delegation of this.response.data.delegation_responses) {
      if (typeof delegation.balance === "string") {
        totalBalance = totalBalance.add(new Int(delegation.balance));
      } else {
        totalBalance = totalBalance.add(new Int(delegation.balance.amount));
      }
    }

    return new CoinPretty(stakeCurrency, totalBalance);
  }

  @computed
  get delegationBalances(): {
    validatorAddress: string;
    balance: CoinPretty;
  }[] {
    if (!this.response) {
      return [];
    }

    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    const result = [];

    for (const delegation of this.response.data.delegation_responses) {
      const balance =
        typeof delegation.balance === "string"
          ? delegation.balance
          : delegation.balance.amount;

      result.push({
        validatorAddress:
          "validator_address" in delegation
            ? delegation.validator_address
            : delegation.delegation.validator_address,
        balance: new CoinPretty(stakeCurrency, new Int(balance)),
      });
    }

    return result;
  }

  @computed
  get delegations(): Delegation[] {
    if (!this.response) {
      return [];
    }

    const result = this.response.data.delegation_responses;
    if (result.length > 0 && "delegation" in result[0]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return result.map((r) => {
        return {
          balance: r.balance,
          delegator_address: r.delegation.delegator_address,
          validator_address: r.delegation.validator_address,
          shares: r.delegation.shares,
        };
      });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return result;
  }

  readonly getDelegationTo = computedFn(
    (validatorAddress: string): CoinPretty => {
      const delegations = this.delegations;

      const stakeCurrency = this.chainGetter.getChain(
        this.chainId
      ).stakeCurrency;

      if (!this.response) {
        return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
      }

      for (const delegation of delegations) {
        if (delegation.validator_address === validatorAddress) {
          return new CoinPretty(
            stakeCurrency,
            new Int(
              typeof delegation.balance === "string"
                ? delegation.balance
                : delegation.balance.amount
            )
          );
        }
      }

      return new CoinPretty(stakeCurrency, new Int(0));
    }
  );
}

export class ObservableQueryDelegations extends ObservableChainQueryMap<
  Delegations | DelegationsStargate
> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryDelegationsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableQueryDelegationsInner {
    return this.get(bech32Address) as ObservableQueryDelegationsInner;
  }
}
