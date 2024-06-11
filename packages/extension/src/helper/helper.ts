// import { ResBalanceEvm, TokenInfo } from '@owallet/types';
// import { urlTxHistory } from '../utils';
// import { fetchRetry } from './api.utils';
// const fetchWrap = require("fetch-retry")(global.fetch);

export const fetchRetry = async (url, config?: any) => {
  const response = await fetch(url, {
    ...config,
  });
  if (response.status !== 200) return;
  const jsonRes = await response.json();
  return jsonRes;
};
export interface ResultBalancesEvm {
  chain: string;
  address: string;
  balance: string;
  tokenAddress: string;
  lastUpdatedBlockNumber: number;
  type: string;
}

export interface ResBalanceEvm {
  result: ResultBalancesEvm[];
  prevPage: string;
  nextPage: string;
}
export const urlTxHistory = "https://tx-history-backend-beta.oraidex.io/";
export class API {
  static async getMultipleTokenInfo({ tokenAddresses }, config?: any) {
    const url = `${urlTxHistory}v1/token-info/by-addresses?tokenAddresses=${tokenAddresses}`;
    return fetchRetry(url, config);
  }

  static async getAllBalancesNativeCosmos({ address, baseUrl }, config?: any) {
    const url = `${baseUrl}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
    return fetchRetry(url, config);
  }

  static async getAllBalancesEvm({ address, network }, config?: any) {
    const url = `${urlTxHistory}raw-tx-history/all/balances?network=${network}&address=${address}`;
    return fetchRetry(url, config) as Promise<ResBalanceEvm>;
  }
}
