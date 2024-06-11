import React, { useMemo } from "react";
import { FooterLayout } from "../../layouts/footer-layout/footer-layout";
import { observer } from "mobx-react-lite";
import { InfoAccountCard } from "./components/info-account-card";
import { TokensCard } from "./components/tokens-card";
import { ClaimReward } from "./components/claim-reward";
import { useStore } from "../../stores";
import { ChainIdEnum } from "@owallet/common";
import {
  initPrice,
  sortTokensByPrice,
  useMultipleAssets,
} from "../../hooks/use-multiple-assets";
import { ViewRawToken } from "../../stores/huge-queries";
import { CoinPretty } from "@owallet/unit";

export const HomePage = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);
  const {
    chainStore,
    accountStore,
    priceStore,
    appInitStore,
    hugeQueriesStore,
    keyRingStore,
  } = useStore();

  const allChainMap = new Map();
  chainStore.chainInfos.map((item, index) => {
    const acc = accountStore.getAccount(item.chainId);
    const address = acc.getAddressDisplay(
      keyRingStore.keyRingLedgerAddresses,
      false
    );
    if (!address) return;
    allChainMap.set(item.chainId, {
      address: address,
      chainInfo: item,
    });
  });
  console.log(allChainMap.values(), "ka");

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const { totalPriceBalance, dataTokens, dataTokensByChain, isLoading } =
    useMultipleAssets(
      accountStore,
      priceStore,
      allChainMap,
      chainStore.current.chainId,
      true,
      appInitStore,
      refreshing,
      accountOrai.bech32Address,
      chainStore.chainInfos.length
    );
  console.log(totalPriceBalance, "totalPriceBalance");
  console.log(dataTokens, "dataTokens");
  let totalPrice = initPrice;
  const dataTokensWithPrice = (dataTokens || []).map(
    (item: ViewRawToken, index) => {
      const coinData = new CoinPretty(item.token.currency, item.token.amount);
      const priceData = priceStore.calculatePrice(coinData);
      totalPrice = totalPrice.add(priceData || initPrice);
      // item.price
      return {
        ...item,
        price: priceData?.toDec()?.toString() || initPrice?.toDec()?.toString(),
      };
    }
  );
  console.log(totalPrice?.toString());
  return (
    <FooterLayout>
      <InfoAccountCard totalPrice={totalPrice} />
      {/*TODO:// need check again Claim reward */}
      {/*<ClaimReward />*/}
      <TokensCard dataTokens={sortTokensByPrice(dataTokensWithPrice)} />
    </FooterLayout>
  );
});
