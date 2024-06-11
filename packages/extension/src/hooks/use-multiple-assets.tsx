// @ts-nocheck
import { useEffect, useState } from "react";
import {
  addressToPublicKey,
  ChainIdEnum,
  CWStargate,
  delay,
  DenomHelper,
  FiatCurrencies,
  getBase58Address,
  getEvmAddress,
  getOasisNic,
  getRpcByChainId,
  parseRpcBalance,
} from "@owallet/common";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@owallet/unit";
import Web3 from "web3";
import { MulticallQueryClient } from "@oraichain/common-contracts-sdk";
import { fromBinary, toBinary } from "@cosmjs/cosmwasm-stargate";
import { OraiswapTokenTypes } from "@oraichain/oraidex-contracts-sdk";
import { ContractCallResults, Multicall } from "@oraichain/ethereum-multicall";
import {
  ERC20__factory,
  network,
  oraichainNetwork,
} from "@oraichain/oraidex-common";
import {
  AddressBtcType,
  AppCurrency,
  ChainInfo,
  IMultipleAsset,
  ViewRawToken,
  ViewTokenData,
} from "@owallet/types";
import {
  AccountStore,
  AccountWithAll,
  CoinGeckoPriceStore,
} from "@owallet/stores";
import { HugeQueriesStore, MapChainIdToNetwork } from "../stores/huge-queries";
import { AppInit } from "../stores/init";
import { API } from "../helper/helper";
import axios from "axios";

export const initPrice = new PricePretty(
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  new Dec("0")
);
export const sortTokensByPrice = (tokens: ViewRawToken[]) => {
  return tokens.sort((a, b) => Number(b.price) - Number(a.price));
};
export const useMultipleAssets = (
  accountStore: AccountStore<AccountWithAll>,
  priceStore: CoinGeckoPriceStore,
  allChainMap: any,
  chainId: string,
  isAllNetwork: boolean,
  appInit: AppInit,
  isRefreshing: boolean,
  bech32Address,
  totalChain
): IMultipleAsset => {
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const [isLoading, setIsLoading] = useState(false);
  const [multipleAssets, setMultipleAssets] = useState({
    totalPriceBalance: "0",
    dataTokens: [],
    dataTokensByChain: null,
  });
  const coinIds = new Map<string, boolean>();
  if (!fiatCurrency) return;

  let tokensByChainId: Record<ChainIdEnum | string, ViewTokenData> | undefined =
    {};
  let overallTotalBalance = "0";
  let allTokens: ViewRawToken[] = [];
  useEffect(() => {
    if (allChainMap.size < totalChain) return;
    init();
  }, [bech32Address, priceStore.defaultVsCurrency, allChainMap.size]);
  useEffect(() => {
    if (!isRefreshing) return;
    if (allChainMap.size < totalChain) return;
    init();
  }, [isRefreshing, allChainMap.size]);
  const pushTokenQueue = async (
    token: AppCurrency,
    amount: string | number,
    chainInfo: ChainInfo,
    type?: string
  ) => {
    const balance = new CoinPretty(token, amount);
    coinIds.set(token?.coinGeckoId, true);
    const price = token?.coinGeckoId
      ? priceStore.calculatePrice(balance)
      : initPrice;
    const rawChainInfo = {
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      chainImage: chainInfo.stakeCurrency.coinImageUrl,
    };
    if (!chainInfo.chainName?.toLowerCase().includes("test")) {
      allTokens.push({
        token: {
          currency: balance.currency,
          amount: amount,
        },
        chainInfo: rawChainInfo,
        // price: price.toDec().toString(),
        type: type
          ? type === AddressBtcType.Bech32
            ? "Segwit"
            : "Legacy"
          : null,
      });
    }

    tokensByChainId[chainInfo.chainId] = {
      tokens: [
        ...(tokensByChainId[chainInfo.chainId]?.tokens || []),
        {
          token: {
            currency: balance.currency,
            amount: amount,
          },
          chainInfo: rawChainInfo,
          // price: price.toDec().toString(),
          type: type
            ? type === AddressBtcType.Bech32
              ? "Segwit"
              : "Legacy"
            : null,
        },
      ],
      // totalBalance: '0'
      totalBalance: (
        new PricePretty(
          fiatCurrency,
          tokensByChainId[chainInfo.chainId]?.totalBalance
        ) || initPrice
      )
        .add(price)
        .toDec()
        .toString(),
    };
  };
  const fetchAllBalancesEvm = async (chains) => {
    const allBalanceChains = chains.map((chain, index) => {
      const { address, chainInfo } = allChainMap.get(chain);
      switch (chain) {
        case ChainIdEnum.BNBChain:
        case ChainIdEnum.Ethereum:
          return getBalancessErc20(address, chainInfo);
        case ChainIdEnum.TRON:
          return getBalancessTrc20(address, chainInfo);
      }
    });
    return Promise.all(allBalanceChains);
  };
  const init = async () => {
    setIsLoading(true);
    try {
      const allChain = Array.from(allChainMap.values());
      // const chainIdsEvm = [
      //   ChainIdEnum.Ethereum,
      //   ChainIdEnum.BNBChain,
      //   ChainIdEnum.TRON,
      // ];
      // console.log(allChain,"allChain")
      // await fetchAllBalancesEvm(chainIdsEvm);
      const allBalancePromises = allChain.map(
        async ({ address, chainInfo }) => {
          if (!address) return;
          switch (chainInfo.networkType) {
            case "cosmos":
              return chainInfo.chainId === ChainIdEnum.Oraichain
                ? Promise.all([
                    getBalanceCW20Oraichain(),
                    getBalanceNativeCosmos(address, chainInfo),
                  ])
                : getBalanceNativeCosmos(address, chainInfo);
            case "evm":
              return chainInfo.chainId === ChainIdEnum.Oasis
                ? getBalanceOasis(address, chainInfo)
                : Promise.all([
                    getBalanceNativeEvm(address, chainInfo),
                    getBalanceErc20(address, chainInfo),
                    fetchAllBalancesEvm([chainInfo.chainId]),
                  ]);
            case "bitcoin":
              const btcAddress = accountStore.getAccount(
                ChainIdEnum.Bitcoin
              ).legacyAddress;
              console.log(btcAddress, "btcAddress");
              return Promise.all([
                getBalanceBtc(address, chainInfo, AddressBtcType.Bech32),
                getBalanceBtc(btcAddress, chainInfo, AddressBtcType.Legacy),
              ]);
          }
        }
      );

      await Promise.allSettled(allBalancePromises);
      setIsLoading(false);
      // const currencies = FiatCurrencies.map(({ currency }) => currency);
      // priceStore.updateURL(Array.from(coinIds.keys()), currencies, true);
      // await delay(300);
      // let overallTotalBalance = "0";
      // let allTokens: ViewRawToken[] = [];
      // // Loop through each key in the data object
      // for (const chain in tokensByChainId) {
      //   if (
      //     tokensByChainId.hasOwnProperty(chain) &&
      //     !tokensByChainId[chain]?.tokens?.[0].chainInfo?.chainName
      //       ?.toLowerCase()
      //       ?.includes("test")
      //   ) {
      //     let totalBalance = initPrice;
      //     const tokensData = await Promise.all(
      //       tokensByChainId[chain].tokens.map(async (infoToken) => {
      //         const { token } = infoToken;
      //         const balance = new CoinPretty(token.currency, token.amount);
      //         const price = token?.currency?.coinGeckoId
      //           ? await priceStore.waitCalculatePrice(balance)
      //           : initPrice;
      //         totalBalance = totalBalance.add(price);
      //         return { ...infoToken, price: price.toDec().toString() };
      //       })
      //     );
      //     tokensByChainId[chain].totalBalance = totalBalance.toDec().toString();
      //     tokensByChainId[chain].tokens = tokensData;
      //     // Add the total balance for each chain to the overall total balance
      //     overallTotalBalance = new PricePretty(
      //       fiatCurrency,
      //       overallTotalBalance
      //     )
      //       .add(
      //         new PricePretty(fiatCurrency, tokensByChainId[chain].totalBalance)
      //       )
      //       .toDec()
      //       .toString();
      //     // Concatenate the tokens for each chain to the allTokens array
      //     allTokens = allTokens.concat(tokensData);
      //   }
      // }
      // console.log(allTokens, "allTokens");
      // appInit.updateMultipleAssets({
      //   dataTokens: allTokens,
      //   totalPriceBalance: overallTotalBalance,
      //   dataTokensByChain: tokensByChainId,
      // });
      setMultipleAssets({
        dataTokens: allTokens,
        totalPriceBalance: overallTotalBalance,
        dataTokensByChain: tokensByChainId,
      });
      console.log("done");
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const getBalancessErc20 = async (address, chainInfo: ChainInfo) => {
    try {
      const res = await API.getAllBalancesEvm({
        address,
        network: MapChainIdToNetwork[chainInfo.chainId],
      });
      if (((res && res.result) || []).length <= 0) return;
      const balanceObj = res.result.reduce((obj, item) => {
        obj[item.tokenAddress] = item.balance;
        return obj;
      }, {});
      const tokenAddresses = res.result
        .map((item, index) => {
          return `${MapChainIdToNetwork[chainInfo.chainId]}%2B${
            item.tokenAddress
          }`;
        })
        .join(",");
      const tokenInfos = await API.getMultipleTokenInfo({ tokenAddresses });
      tokenInfos.forEach((tokeninfo, index) => {
        const token = chainInfo.currencies.find(
          (item, index) =>
            item.coinDenom?.toUpperCase() === tokeninfo.abbr?.toUpperCase()
        );
        if (!token) {
          const infoToken: any = [
            {
              coinImageUrl: tokeninfo.imgUrl,
              coinDenom: tokeninfo.abbr,
              coinGeckoId: tokeninfo.coingeckoId,
              coinDecimals: tokeninfo.decimal,
              coinMinimalDenom: `erc20:${tokeninfo.contractAddress}:${tokeninfo.name}`,
              contractAddress: tokeninfo.contractAddress,
            },
          ];
          const amount = new Dec(balanceObj[tokeninfo.contractAddress]).mul(
            DecUtils.getTenExponentN(tokeninfo.decimal)
          );
          pushTokenQueue(infoToken[0], amount.roundUp().toString(), chainInfo);
          chainInfo.addCurrencies(...infoToken);
        }
      });
    } catch (e) {
      console.log(e, "e1");
    }
  };
  const getBalancessTrc20 = async (address, chainInfo: ChainInfo) => {
    try {
      const res = await API.getAllBalancesEvm({
        address: getBase58Address(address),
        network: MapChainIdToNetwork[chainInfo.chainId],
      });
      if (!res?.trc20) return;
      const result = res?.trc20.reduce((acc, curr) => {
        const key = Object.keys(curr)[0];
        acc[key] = curr[key];
        return acc;
      }, {});
      console.log(result, "result");
      const tokenAddresses = res?.trc20
        .map((item, index) => {
          return `${MapChainIdToNetwork[chainInfo.chainId]}%2B${
            Object.keys(item)[0]
          }`;
        })
        .join(",");
      const tokenInfos = await API.getMultipleTokenInfo({ tokenAddresses });
      tokenInfos.forEach((tokeninfo, index) => {
        const token = chainInfo.currencies.find(
          (item, index) =>
            item.coinDenom?.toUpperCase() === tokeninfo.abbr?.toUpperCase()
        );
        if (!token) {
          const infoToken: any = [
            {
              coinImageUrl: tokeninfo.imgUrl,
              coinDenom: tokeninfo.abbr,
              coinGeckoId: tokeninfo.coingeckoId,
              coinDecimals: tokeninfo.decimal,
              coinMinimalDenom: `erc20:${getEvmAddress(
                tokeninfo.contractAddress
              )}:${tokeninfo.name}`,
              contractAddress: tokeninfo.contractAddress,
            },
          ];
          pushTokenQueue(
            infoToken[0],
            result[tokeninfo.contractAddress],
            chainInfo
          );
          chainInfo.addCurrencies(...infoToken);
        }
      });
    } catch (e) {
      console.log(e, "e1");
    }
  };

  const getBalanceNativeEvm = async (address, chainInfo: ChainInfo) => {
    const web3 = new Web3(getRpcByChainId(chainInfo, chainInfo.chainId));
    const ethBalance = await web3.eth.getBalance(address);
    if (ethBalance) {
      pushTokenQueue(chainInfo.stakeCurrency, Number(ethBalance), chainInfo);
    }
  };

  const getBalanceBtc = async (
    address,
    chainInfo: ChainInfo,
    type: AddressBtcType
  ) => {
    const client = axios.create({ baseURL: chainInfo.rest });
    const { data } = await client.get(`/address/${address}/utxo`);
    if (data) {
      const totalBtc = data.reduce((acc, curr) => acc + curr.value, 0);
      pushTokenQueue(chainInfo.stakeCurrency, totalBtc, chainInfo, type);
    }
  };

  const getBalanceNativeCosmos = async (address, chainInfo: ChainInfo) => {
    const res = await API.getAllBalancesNativeCosmos({
      address: address,
      baseUrl: chainInfo.rest,
    });
    console.log(res.balances, "res");
    const mergedMaps = chainInfo.currencyMap;
    const allTokensAddress = [];
    const balanceObj = res.balances.reduce((obj, item) => {
      obj[item.denom] = item.amount;
      return obj;
    }, {});
    console.log(balanceObj);
    res.balances.forEach(({ denom, amount }) => {
      const token = mergedMaps.get(denom);
      if (token) {
        pushTokenQueue(token, amount, chainInfo);
      } else {
        if (!MapChainIdToNetwork[chainInfo.chainId]) return;
        const str = `${
          MapChainIdToNetwork[chainInfo.chainId]
        }%2B${new URLSearchParams(denom).toString().replace("=", "")}`;
        allTokensAddress.push(str);
      }
    });
    if (allTokensAddress.length === 0) return;
    const tokenInfos = await API.getMultipleTokenInfo({
      tokenAddresses: allTokensAddress.join(","),
    });
    tokenInfos.forEach((tokeninfo, index) => {
      const token = chainInfo.currencies.find(
        (item, index) =>
          item.coinDenom?.toUpperCase() === tokeninfo.abbr?.toUpperCase()
      );
      if (!token) {
        const infoToken: any = [
          {
            coinImageUrl: tokeninfo.imgUrl,
            coinDenom: tokeninfo.abbr,
            coinGeckoId: tokeninfo.coingeckoId,
            coinDecimals: tokeninfo.decimal,
            coinMinimalDenom: tokeninfo.denom,
          },
        ];
        pushTokenQueue(infoToken[0], balanceObj[tokeninfo.denom], chainInfo);
        chainInfo.addCurrencies(...infoToken);
      }
    });
  };

  const getBalanceCW20Oraichain = async () => {
    const oraiNetwork = allChainMap.get(ChainIdEnum.Oraichain);
    const chainInfo = oraiNetwork.chainInfo;
    const mergedMaps = chainInfo.currencyMap;
    const data = toBinary({
      balance: {
        address: oraiNetwork.address,
      },
    });

    try {
      const cwStargate = {
        account: accountStore.getAccount(ChainIdEnum.Oraichain),
        chainId: ChainIdEnum.Oraichain,
        rpc: oraichainNetwork.rpc,
      };
      const client = await CWStargate.init(
        cwStargate.account,
        cwStargate.chainId,
        cwStargate.rpc
      );

      const tokensCw20 = chainInfo.currencies.filter(
        (item) => new DenomHelper(item.coinMinimalDenom).contractAddress
      );
      const multicall = new MulticallQueryClient(client, network.multicall);
      const res = await multicall.aggregate({
        queries: tokensCw20.map((t) => ({
          address: new DenomHelper(t.coinMinimalDenom).contractAddress,
          data,
        })),
      });

      tokensCw20.map((t, ind) => {
        if (res.return_data[ind].success) {
          const balanceRes = fromBinary(
            res.return_data[ind].data
          ) as OraiswapTokenTypes.BalanceResponse;
          const token = mergedMaps.get(t.coinMinimalDenom);
          if (token) {
            pushTokenQueue(token, balanceRes.balance, chainInfo);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching CW20 balance:", error);
    }
  };

  const getBalanceOasis = async (address, chainInfo: ChainInfo) => {
    const nic = getOasisNic(chainInfo.raw.grpc);
    const publicKey = await addressToPublicKey(address);
    const account = await nic.stakingAccount({ owner: publicKey, height: 0 });
    const grpcBalance = parseRpcBalance(account);
    if (grpcBalance) {
      pushTokenQueue(chainInfo.stakeCurrency, grpcBalance.available, chainInfo);
    }
  };

  const getBalanceErc20 = async (address, chainInfo: ChainInfo) => {
    const multicall = new Multicall({
      nodeUrl: getRpcByChainId(chainInfo, chainInfo.chainId),
      multicallCustomContractAddress: null,
      chainId: Number(chainInfo.chainId),
    });

    const tokensErc20 = chainInfo.currencies.filter(
      (item) => new DenomHelper(item.coinMinimalDenom).type !== "native"
    );

    const input = tokensErc20.map((token) => ({
      reference: token.coinDenom,
      contractAddress: new DenomHelper(token.coinMinimalDenom).contractAddress,
      abi: ERC20__factory.abi,
      calls: [
        {
          reference: token.coinDenom,
          methodName: "balanceOf(address)",
          methodParameters: [address],
        },
      ],
    }));

    const results: ContractCallResults = await multicall.call(input as any);
    tokensErc20.forEach((token) => {
      const amount =
        results.results[token.coinDenom].callsReturnContext[0].returnValues[0]
          .hex;
      pushTokenQueue(token, Number(amount), chainInfo);
    });
  };

  return {
    totalPriceBalance: multipleAssets.totalPriceBalance,
    dataTokens: isAllNetwork
      ? sortTokensByPrice([...(multipleAssets.dataTokens || [])])
      : sortTokensByPrice([
          ...(multipleAssets.dataTokensByChain?.[chainId]?.tokens || []),
        ]),
    dataTokensByChain: multipleAssets.dataTokensByChain,
    isLoading: isLoading,
  };
};
