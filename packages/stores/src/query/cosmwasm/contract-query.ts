import { ObservableChainQuery } from "../chain-query";
import { QuerySharedContext } from "../../common";

import { Buffer } from "buffer";
import { ChainGetter } from "../../chain";

export class ObservableCosmwasmContractChainQuery<
  T
> extends ObservableChainQuery<T> {
  protected disposer?: () => void;
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected obj: object
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      ObservableCosmwasmContractChainQuery.getUrlFromObj(
        contractAddress,
        obj,
        chainGetter.getChain(chainId).beta
      )
    );
  }

  protected static getUrlFromObj(
    contractAddress: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    obj: object,
    beta?: boolean
  ): string {
    const msg = JSON.stringify(obj);
    const query = Buffer.from(msg).toString("base64");

    return `/cosmwasm/wasm/${
      beta ? "v1beta1" : "v1"
    }/contract/${contractAddress}/smart/${query}`;
  }

  protected canFetch(): boolean {
    return this.contractAddress.length !== 0;
  }

  protected override async fetchResponse(
    abortController: AbortController
  ): Promise<{ headers: any; data: T }> {
    const { data, headers } = await super.fetchResponse(abortController);

    const wasmResult = data as unknown as
      | {
          data: any;
        }
      | undefined;

    if (!wasmResult) {
      throw new Error("Failed to get the response from the contract");
    }

    return {
      headers,
      data: wasmResult.data as T,
    };
  }
}
