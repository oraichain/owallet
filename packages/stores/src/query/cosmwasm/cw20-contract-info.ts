import { Cw20ContractTokenInfo } from "./types";
import { KVStore } from "@owallet/common";
import { ObservableChainQueryMap } from "../chain-query";
import { ChainGetter } from "../../common";
import { computed } from "mobx";
import { ObservableCosmwasmContractChainQuery } from "./contract-query";
import { QuerySharedContext } from "src/common/query/context";

export class ObservableQueryCw20ContactInfoInner extends ObservableCosmwasmContractChainQuery<Cw20ContractTokenInfo> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, contractAddress, {
      token_info: {},
    });
  }

  @computed
  get tokenInfo(): Cw20ContractTokenInfo | undefined {
    if (!this.response || !this.response.data) {
      return undefined;
    }

    return this.response?.data?.token_info_response ?? this.response?.data;
  }
}

export class ObservableQueryCw20ContractInfo extends ObservableChainQueryMap<Cw20ContractTokenInfo> {
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (contractAddress: string) => {
      return new ObservableQueryCw20ContactInfoInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        contractAddress
      );
    });
  }

  getQueryContract(
    contractAddress: string
  ): ObservableQueryCw20ContactInfoInner {
    return this.get(contractAddress) as ObservableQueryCw20ContactInfoInner;
  }
}
