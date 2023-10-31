import Long from 'long';
import bech32 from 'bech32';
import { TokenItemType, network } from '@oraichain/oraidex-common';
import { Address } from '@owallet/crypto';
import {
  cosmosTokens,
  flattenTokens,
  oraichainTokens,
  CoinGeckoId,
  NetworkChainId,
  toAmount,
  toDisplay,
  atomic,
  parseTokenInfo
} from '@oraichain/oraidex-common';
import { TokenInfo } from '../types/token';
import { SimulateSwapOperationsResponse } from '@oraichain/oraidex-contracts-sdk/build/OraiswapRouter.types';
import { generateSwapOperationMsgs, getEvmSwapRoute, isEvmSwappable } from '../api';
import { ethers } from 'ethers';
import { IUniswapV2Router02__factory } from '../config/abi/v2-periphery/contracts/interfaces';
import { HIGH_GAS_PRICE, MULTIPLIER, proxyContractInfo, swapEvmRoutes } from '../config/constants';
import { CosmWasmClient, OraiswapOracleQueryClient, OraiswapRouterQueryClient } from '@oraichain/oraidex-contracts-sdk';
import { CwIcs20LatestQueryClient } from '@oraichain/common-contracts-sdk';
import { swapToTokens } from '../config';
import { TaxRateResponse } from '@oraichain/oraidex-contracts-sdk/build/OraiswapOracle.types';
import { Ratio } from '@oraichain/common-contracts-sdk/build/CwIcs20Latest.types';

export enum SwapDirection {
  From,
  To
}

export const calculateTimeoutTimestamp = (timeout: number): string => {
  return Long.fromNumber(Math.floor(Date.now() / 1000) + timeout)
    .multiply(1000000000)
    .toString();
};

export const getNetworkGasPrice = async (): Promise<number> => {
  try {
    // const chainInfosWithoutEndpoints =
    //   await window.Keplr?.getChainInfosWithoutEndpoints();
    // const findToken = chainInfosWithoutEndpoints.find(
    //   e => e.chainId == network.chainId
    // );
    // if (findToken) {
    //   return findToken.feeCurrencies[0].gasPriceStep.average;
    // }
  } catch {}
  return 0;
};

export function isEvmNetworkNativeSwapSupported(chainId: NetworkChainId) {
  switch (chainId) {
    case '0x01':
    case '0x38':
      return true;
    default:
      return false;
  }
}

//hardcode fee
export const feeEstimate = (tokenInfo: TokenItemType, gasDefault: number) => {
  if (!tokenInfo) return 0;
  return (gasDefault * MULTIPLIER * HIGH_GAS_PRICE) / 10 ** tokenInfo?.decimals;
};

export const getTransferTokenFee = async ({ remoteTokenDenom, client }): Promise<Ratio | undefined> => {
  try {
    const ibcWasmContractAddress = process.env.REACT_APP_IBC_WASM_CONTRACT;
    const ibcWasmContract = new CwIcs20LatestQueryClient(client, ibcWasmContractAddress);
    const ratio = await ibcWasmContract.getTransferTokenFee({
      remoteTokenDenom
    });
    return ratio;
  } catch (error) {
    console.log({ error });
  }
};

export function getTokenOnSpecificChainId(
  coingeckoId: CoinGeckoId,
  chainId: NetworkChainId
): TokenItemType | undefined {
  return flattenTokens.find(t => t.coinGeckoId === coingeckoId && t.chainId === chainId);
}

export const tronToEthAddress = (base58: string) => Address.getEvmAddress(base58);

export const ethToTronAddress = (address: string) => {
  return Address.getBase58Address(address);
};

export const getTokenOnOraichain = (coingeckoId: CoinGeckoId) => {
  if (coingeckoId === 'kawaii-islands' || coingeckoId === 'milky-token') {
    throw new Error('KWT and MILKY not supported in this function');
  }
  return oraichainTokens.find(token => token.coinGeckoId === coingeckoId);
};

export async function fetchTaxRate(client: CosmWasmClient): Promise<TaxRateResponse> {
  const oracleContract = new OraiswapOracleQueryClient(client, network.oracle);
  try {
    const data = await oracleContract.treasury({ tax_rate: {} });
    return data as TaxRateResponse;
  } catch (error) {
    throw new Error(`Error when query TaxRate using oracle: ${error}`);
  }
}

export async function simulateSwap(
  query: {
    fromInfo: TokenInfo;
    toInfo: TokenInfo;
    amount: string;
  },
  client: CosmWasmClient
) {
  const { amount, fromInfo, toInfo } = query;

  // check for universal-swap 2 tokens that have same coingeckoId, should return simulate data with average ratio 1-1.
  if (fromInfo.coinGeckoId === toInfo.coinGeckoId) {
    return {
      amount
    };
  }

  // check if they have pairs. If not then we go through ORAI
  const { info: offerInfo } = parseTokenInfo(fromInfo, amount.toString());
  const { info: askInfo } = parseTokenInfo(toInfo);
  const routerContract = new OraiswapRouterQueryClient(client, network.router);
  const operations = generateSwapOperationMsgs(offerInfo, askInfo);
  try {
    const data = await routerContract.simulateSwapOperations({
      offerAmount: amount.toString(),
      operations
    });

    return data;
  } catch (error) {
    console.log(`Error when trying to simulate swap using router v2: ${error}`);
    throw new Error(`Error when trying to simulate swap using router v2: ${error}`);
  }
}

export async function simulateSwapEvm(query: { fromInfo: TokenItemType; toInfo: TokenItemType; amount: string }) {
  const { amount, fromInfo, toInfo } = query;

  // check for universal-swap 2 tokens that have same coingeckoId, should return simulate data with average ratio 1-1.
  if (fromInfo.coinGeckoId === toInfo.coinGeckoId) {
    return {
      amount
    };
  }
  try {
    // get proxy contract object so that we can query the corresponding router address
    const provider = new ethers.providers.JsonRpcProvider(fromInfo.rpc);
    const toTokenInfoOnSameChainId = getTokenOnSpecificChainId(toInfo.coinGeckoId, fromInfo.chainId);
    const swapRouterV2 = IUniswapV2Router02__factory.connect(proxyContractInfo[fromInfo.chainId].routerAddr, provider);
    const route = getEvmSwapRoute(fromInfo.chainId, fromInfo.contractAddress, toTokenInfoOnSameChainId.contractAddress);
    const outs = await swapRouterV2.getAmountsOut(amount, route);
    console.log('outs simulateSwapEvm ===', outs, outs.slice(-1)[0].toString());
    return {
      amount: outs.slice(-1)[0].toString() // get the final out amount, which is the token out amount we want
    };
  } catch (ex) {
    console.log('error simulating evm: ', ex);
  }
}

export function isSupportedNoPoolSwapEvm(coingeckoId: CoinGeckoId) {
  switch (coingeckoId) {
    case 'wbnb':
    case 'weth':
      return true;
    default:
      return false;
  }
}

export async function handleSimulateSwap(
  query: {
    fromInfo: TokenInfo;
    toInfo: TokenInfo;
    originalFromInfo: TokenItemType;
    originalToInfo: TokenItemType;
    amount: string;
  },
  client: CosmWasmClient
): Promise<SimulateSwapOperationsResponse> {
  // if the from token info is on bsc or eth, then we simulate using uniswap / pancake router
  // otherwise, simulate like normal
  if (
    isSupportedNoPoolSwapEvm(query.originalFromInfo.coinGeckoId) ||
    isEvmSwappable({
      fromChainId: query.originalFromInfo.chainId,
      toChainId: query.originalToInfo.chainId,
      fromContractAddr: query.originalFromInfo.contractAddress,
      toContractAddr: query.originalToInfo.contractAddress
    })
  ) {
    // reset previous amount calculation since now we need to deal with original from & to info, not oraichain token info
    const originalAmount = toDisplay(query.amount, query.fromInfo.decimals);
    return simulateSwapEvm({
      fromInfo: query.originalFromInfo,
      toInfo: query.originalToInfo,
      amount: toAmount(originalAmount, query.originalFromInfo.decimals).toString()
    });
  }

  return simulateSwap(query, client);
}

export function filterTokens(
  chainId: string,
  coingeckoId: CoinGeckoId,
  denom: string,
  searchTokenName: string,
  direction: SwapDirection
) {
  // basic filter. Dont include itself & only collect tokens with searched letters
  let filteredToTokens = swapToTokens.filter(token => token.denom !== denom && token.name.includes(searchTokenName));
  // special case for tokens not having a pool on Oraichain
  if (isSupportedNoPoolSwapEvm(coingeckoId)) {
    const swappableTokens = Object.keys(swapEvmRoutes[chainId]).map(key => key.split('-')[1]);
    const filteredTokens = filteredToTokens.filter(token => swappableTokens.includes(token.contractAddress));

    // tokens that dont have a pool on Oraichain like WETH or WBNB cannot be swapped from a token on Oraichain
    if (direction === SwapDirection.To)
      return [...new Set(filteredTokens.concat(filteredTokens.map(token => getTokenOnOraichain(token.coinGeckoId))))];
    filteredToTokens = filteredTokens;
  }
  return filteredToTokens;
}

export const calculateMinimum = (simulateAmount: number | string, userSlippage: number): bigint | string => {
  if (!simulateAmount) return '0';
  try {
    return (
      BigInt(simulateAmount) - (BigInt(simulateAmount) * BigInt(userSlippage * atomic)) / (BigInt(100) * BigInt(atomic))
    );
  } catch (error) {
    console.log({ error });
    return '0';
  }
};

export const findToTokenOnOraiBridge = (fromToken: TokenItemType, toNetwork: NetworkChainId) => {
  const toToken = cosmosTokens.find(t =>
    t.chainId === 'oraibridge-subnet-2' && t.coinGeckoId === fromToken.coinGeckoId && t?.bridgeNetworkIdentifier
      ? t.bridgeNetworkIdentifier === toNetwork
      : t.chainId === toNetwork
  );
  return toToken;
};

// export const transferEvmToIBC = async (
//   from: TokenItemType,
//   fromAmount: number,
//   address: {
//     metamaskAddress?: string;
//     tronAddress?: string;
//     oraiAddress?: string;
//   },
//   combinedReceiver: string
// ) => {
//   const { metamaskAddress, tronAddress, oraiAddress } = address;
//   const finalTransferAddress = window.Metamask.getFinalEvmAddress(
//     from.chainId,
//     {
//       metamaskAddress,
//       tronAddress
//     }
//   );
//   const oraiAddr = oraiAddress ?? (await window.Keplr.getKeplrAddr());
//   if (!finalTransferAddress || !oraiAddr)
//     throw generateError('Please login both metamask or tronlink and keplr!');
//   const gravityContractAddr = gravityContracts[from!.chainId!];
//   if (!gravityContractAddr || !from) {
//     throw generateError('No gravity contract addr or no from token');
//   }

//   const finalFromAmount = toAmount(fromAmount, from.decimals).toString();
//   await window.Metamask.checkOrIncreaseAllowance(
//     from,
//     finalTransferAddress,
//     gravityContractAddr,
//     finalFromAmount
//   );
//   const result = await window.Metamask.transferToGravity(
//     from,
//     finalFromAmount,
//     finalTransferAddress,
//     combinedReceiver
//   );
//   return result;
// };
