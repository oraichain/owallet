export interface TxResponse {
  height: number;
  txHash: string;
  codespace: string;
  code: number;
  data?: string;
  rawLog: string;
  logs?: any[];
  info?: string;
  gasWanted: number;
  gasUsed: number;
  timestamp: string;
  events?: any[];
}

/* eslint-disable camelcase */
export interface RestSignerInfo {
  public_key: any;
  mode_info: any;
  sequence: string;
}

export interface RestAuthInfo {
  signer_infos: RestSignerInfo[];
  fee: any;
}

export interface RestTxBody {
  messages: any[];
  memo: string;
  timeout_height: string;
}

export interface RestTx {
  body: RestTxBody;
  auth_info: RestAuthInfo;
  signatures: string[];
}

export interface RestTxLog {
  msg_index: number;
  log: string;
  events: { type: string; attributes: { key: string; value: string }[] }[];
}

export interface TxInfoResponse {
  height: string;
  txhash: string;
  codespace: string;
  code: number;
  data: string;
  raw_log: string;
  logs: RestTxLog[];
  info: string;
  gas_wanted: string;
  gas_used: string;
  tx: RestTx;
  timestamp: string;
}

export interface TxInfo {
  height: string;
  txhash: string;
  codespace: string;
  code: number;
  data: string;
  rawLog: string;
  gasWanted: string;
  gasUsed: string;
  logs: RestTxLog[];
  info: string;
  tx: RestTx;
  timestamp: string;
}

export enum BroadcastMode {
  Sync = "BROADCAST_MODE_SYNC",
  Async = "BROADCAST_MODE_ASYNC",
  Block = "BROADCAST_MODE_BLOCK",
}

export interface TxResultResponse {
  tx: RestTx;
  tx_response: TxInfoResponse;
}

export interface TxResult {
  tx: RestTx;
  txResponse: TxInfo;
}

export interface TxSearchResult {
  pagination: any;
  txs: TxInfo[];
}

export interface TxSearchResultParams {
  txs: RestTx[];
  tx_responses: TxInfo;
  pagination: any;
}

export interface SimulationResponse {
  gas_info: {
    gas_wanted: string;
    gas_used: string;
  };
  result: {
    data: string;
    log: string;
    events: { type: string; attributes: { key: string; value: string }[] }[];
  };
}

export interface TxResTron {
  id: string;
  fee: number;
  blockNumber: number;
  blockTimeStamp: number;
  contractResult: string[];
  contract_address: string;
  receipt: Receipt;
  log: Log[];
  packingFee: number;
}

export interface Receipt {
  energy_usage: number;
  energy_fee: number;
  energy_usage_total: number;
  net_fee: number;
  result: string;
}

export interface Log {
  address: string;
  topics: string[];
  data: string;
}
