import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { OWBox } from "../../components/card";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text } from "@src/components/text";
import { useStore } from "../../stores";
import { useTheme } from "@src/themes/theme-provider";
import { getTotalUsd, chainIcons } from "@oraichain/oraidex-common";
import { DownArrowIcon } from "@src/components/icon";
import { metrics, spacing } from "@src/themes";
import MyWalletModal from "./components/my-wallet-modal/my-wallet-modal";
import { ChainIdEnum } from "@owallet/common";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { CopyAddressModal } from "./components/copy-address/copy-address-modal";
import { getTokenInfos } from "@src/utils/helper";
import { useSmartNavigation } from "@src/navigation.provider";
import { SCREENS } from "@src/common/constants";
import { navigate } from "@src/router/root";
import { LoadingSpinner } from "@src/components/spinner";
import OWText from "@src/components/text/ow-text";
import { CoinPretty, Dec, PricePretty } from "@owallet/unit";

export const AccountBoxAll: FunctionComponent<{}> = observer(({}) => {
  const { colors } = useTheme();
  const {
    universalSwapStore,
    accountStore,
    modalStore,
    chainStore,
    appInitStore,
    queriesStore,
    keyRingStore,
    priceStore,
  } = useStore();
  const [profit, setProfit] = useState(0);
  const [isOpen, setModalOpen] = useState(false);

  const smartNavigation = useSmartNavigation();

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);

  // const chainAssets = getTokenInfos({
  //   tokens: universalSwapStore.getAmount,
  //   prices: appInitStore.getInitApp.prices,
  //   networkFilter: chainStore.current.chainId,
  // });
  const queries = queriesStore.get(chainStore.current.chainId);
  const styles = styling(colors);
  let totalUsd: number = 0;
  if (appInitStore.getInitApp.prices) {
    totalUsd = getTotalUsd(
      universalSwapStore.getAmount,
      appInitStore.getInitApp.prices
    );
  }

  const account = accountStore.getAccount(chainStore.current.chainId);

  const _onPressMyWallet = () => {
    modalStore.setOptions({
      bottomSheetModalConfig: {
        enablePanDownToClose: false,
        enableOverDrag: false,
      },
    });
    modalStore.setChildren(MyWalletModal());
  };

  const address = account.getAddressDisplay(
    keyRingStore.keyRingLedgerAddresses
  );
  const accountTronInfo =
    chainStore.current.chainId === ChainIdEnum.TRON
      ? queries.tron.queryAccount.getQueryWalletAddress(address)
      : null;

  const fiat = priceStore.defaultVsCurrency;

  const allChain = chainStore.chainInfos;
  const fiatCurrency = priceStore.getFiatCurrency(fiat);
  if (!fiatCurrency) {
    return undefined;
  }
  let chainBalance: PricePretty = new PricePretty(fiatCurrency, new Dec("0"));
  let totalBalance: PricePretty = new PricePretty(fiatCurrency, new Dec("0"));
  const getBalanceByChainId = (chainId, networkType, stakeCurrency) => {
    const addressByChainId = accountStore
      .getAccount(chainId)
      .getAddressDisplay(keyRingStore.keyRingLedgerAddresses, false);
    const queriesBalances = queriesStore
      .get(chainId)
      .queryBalances.getQueryBech32Address(addressByChainId);
    const stakable = queriesBalances.stakable.balance;
    const tokens = queriesBalances.positiveNativeUnstakables.concat(
      queriesBalances.nonNativeBalances
    );
    let stakedSum: CoinPretty = new CoinPretty(stakeCurrency, new Dec("0"));
    if (networkType === "cosmos") {
      const queryDelegated =
        queries.cosmos.queryDelegations.getQueryBech32Address(addressByChainId);
      const delegated = queryDelegated.total;
      const queryUnbonding =
        queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
          addressByChainId
        );
      const unbonding = queryUnbonding.total;

      stakedSum = delegated.add(unbonding);
    }

    const totalStake = stakable.add(stakedSum);
    if (totalStake.isReady) {
      let stakeRes = priceStore.calculatePrice(totalStake, fiat);
      for (const token of tokens) {
        const tokenBalance = priceStore.calculatePrice(token.balance, fiat);
        if (tokenBalance) {
          stakeRes = stakeRes.add(tokenBalance);
        }
      }
      if (
        !appInitStore.getInitApp.isAllNetworks &&
        chainId === chainStore.current.chainId
      ) {
        chainBalance = chainBalance.add(stakeRes);
      }
      totalBalance = totalBalance.add(stakeRes);
    }
  };

  console.log(fiatCurrency, "allChain");

  for (let i = 0; i < allChain.length; i++) {
    const chainId = allChain[i].chainId;
    const networkType = allChain[i].networkType;
    const stakeCurrency = allChain[i].stakeCurrency;
    getBalanceByChainId(chainId, networkType, stakeCurrency);
  }
  useEffect(() => {
    let yesterdayBalance = 0;
    const yesterdayAssets = appInitStore.getInitApp.yesterdayPriceFeed;

    if (yesterdayAssets?.length > 0) {
      yesterdayAssets.map((y) => {
        yesterdayBalance += y.value ?? 0;
      });

      setProfit(
        Number(
          Number(
            Number(totalBalance.toDec().roundUp().toString()) - yesterdayBalance
          ).toFixed(2)
        )
      );
    } else {
      setProfit(0);
    }
  }, [totalBalance, accountOrai.bech32Address, appInitStore]);

  const renderTotalBalance = () => {
    // const chainIcon = chainIcons.find(
    //   (c) => c.chainId === chainStore.current.chainId
    // );
    // let chainBalance = 0;
    //
    // chainAssets?.map((a) => {
    //   chainBalance += a.value;
    // });

    return (
      <>
        <Text variant="bigText" style={styles.labelTotalAmount}>
          {totalBalance.toString()}
        </Text>
        <Text
          style={styles.profit}
          color={colors[profit < 0 ? "error-text-body" : "success-text-body"]}
        >
          {profit < 0 ? "" : "+"}
          {profit &&
          Number(totalBalance.toDec().roundUp().toString()) &&
          Number(totalBalance.toDec().roundUp().toString()) > 0
            ? Number(
                (profit / Number(totalBalance.toDec().roundUp().toString())) *
                  100 ?? 0
              ).toFixed(2)
            : 0}
          % ($
          {profit?.toFixed(2) ?? 0}) Today
        </Text>

        {appInitStore.getInitApp.isAllNetworks ? null : (
          <>
            <View
              style={{
                borderTopWidth: 1,
                borderColor: colors["neutral-border-default"],
                marginVertical: 8,
                paddingVertical: 8,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: colors["neutral-text-action-on-dark-bg"],
                    borderRadius: 16,
                  }}
                >
                  {/*<OWIcon*/}
                  {/*  type="images"*/}
                  {/*  source={{ uri: chainIcon?.Icon }}*/}
                  {/*  size={16}*/}
                  {/*/>*/}
                </View>
                <Text
                  style={{
                    paddingLeft: 6,
                  }}
                  size={16}
                  weight="600"
                  color={colors["neutral-text-title"]}
                >
                  {chainStore.current.chainName}
                </Text>
              </View>

              <Text size={16} weight="600" color={colors["neutral-text-title"]}>
                {chainBalance.toString()}
              </Text>
            </View>
            {chainStore.current.chainId === ChainIdEnum.TRON && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <OWText
                    size={16}
                    weight="600"
                    color={colors["neutral-text-title"]}
                  >
                    My Energy:
                  </OWText>
                  <OWText
                    size={16}
                    weight="600"
                    color={colors["neutral-text-body"]}
                  >{`${accountTronInfo?.energyRemaining?.toString()}/${accountTronInfo?.energyLimit?.toString()}`}</OWText>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <OWText
                    size={16}
                    weight="600"
                    color={colors["neutral-text-title"]}
                  >
                    My Bandwidth:
                  </OWText>
                  <OWText
                    size={16}
                    weight="600"
                    color={colors["neutral-text-body"]}
                  >{`${accountTronInfo?.bandwidthRemaining?.toString()}/${accountTronInfo?.bandwidthLimit?.toString()}`}</OWText>
                </View>
              </>
            )}
          </>
        )}
      </>
    );
  };
  return (
    <View>
      <CopyAddressModal
        close={() => setModalOpen(false)}
        isOpen={isOpen}
        bottomSheetModalConfig={{
          enablePanDownToClose: false,
          enableOverDrag: false,
        }}
      />
      <OWBox style={styles.containerOWBox}>
        <View style={styles.containerInfoAccount}>
          {/*{!universalSwapStore.getLoadStatus.isLoad && (*/}
          {/*  <View style={styles.containerLoading}>*/}
          {/*    <LoadingSpinner color={colors["gray-150"]} size={22} />*/}
          {/*  </View>*/}
          {/*)}*/}
          <TouchableOpacity onPress={_onPressMyWallet} style={styles.btnAcc}>
            <Image
              style={styles.infoIcon}
              source={require("../../assets/images/default-avatar.png")}
              resizeMode="contain"
              fadeDuration={0}
            />
            <Text style={styles.labelName}>{account?.name || ".."}</Text>
            <DownArrowIcon height={15} color={colors["primary-text"]} />
          </TouchableOpacity>
          <OWButton
            type="secondary"
            textStyle={{
              fontSize: 14,
              fontWeight: "600",
              color: colors["neutral-text-action-on-light-bg"],
            }}
            icon={
              <OWIcon
                size={14}
                name="copy"
                color={colors["neutral-text-action-on-light-bg"]}
              />
            }
            style={styles.copy}
            label="Copy address"
            onPress={() => {
              setModalOpen(true);
            }}
          />
        </View>
        <View style={styles.overview}>{renderTotalBalance()}</View>
        <View style={styles.btnGroup}>
          <OWButton
            style={styles.getStarted}
            textStyle={{
              fontSize: 14,
              fontWeight: "600",
              color: colors["neutral-text-action-on-dark-bg"],
            }}
            label="Receive"
            onPress={() => {
              navigate(SCREENS.STACK.Others, {
                screen: SCREENS.QRScreen,
              });
              return;
            }}
          />
          <OWButton
            textStyle={{
              fontSize: 14,
              fontWeight: "600",
              color: colors["neutral-text-action-on-dark-bg"],
            }}
            style={styles.getStarted}
            label={appInitStore.getInitApp.isAllNetworks ? "Buy" : "Send"}
            onPress={() => {
              // smartNavigation.navigateSmart("NewSend", {
              //   currency: chainStore.current.stakeCurrency.coinMinimalDenom,
              // });
              if (appInitStore.getInitApp.isAllNetworks) {
                navigate(SCREENS.STACK.Others, {
                  screen: SCREENS.BuyFiat,
                });
                return;
              }
              if (chainStore.current.chainId === ChainIdEnum.TRON) {
                smartNavigation.navigateSmart("SendTron", {
                  currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                });
              } else if (chainStore.current.chainId === ChainIdEnum.Oasis) {
                smartNavigation.navigateSmart("SendOasis", {
                  currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                });
              } else if (chainStore.current.networkType === "bitcoin") {
                navigate(SCREENS.STACK.Others, {
                  screen: SCREENS.SendBtc,
                });
              } else if (chainStore.current.networkType === "evm") {
                navigate(SCREENS.STACK.Others, {
                  screen: SCREENS.SendEvm,
                });
              } else {
                smartNavigation.navigateSmart("NewSend", {
                  currency: chainStore.current.stakeCurrency.coinMinimalDenom,
                });
              }
            }}
          />
        </View>
      </OWBox>
    </View>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerOWBox: {
      marginHorizontal: 16,
      width: metrics.screenWidth - 32,
      padding: spacing["16"],
      backgroundColor: colors["neutral-surface-card"],
    },
    overview: {
      marginTop: 12,
      marginBottom: 16,
    },
    labelTotalAmount: {
      color: colors["neutral-text-heading"],
      fontWeight: "500",
    },
    profit: {
      fontWeight: "400",
      lineHeight: 20,
    },
    labelName: {
      paddingLeft: spacing["6"],
      paddingRight: 10,
      fontWeight: "600",
      fontSize: 16,
      color: colors["neutral-text-title"],
    },
    infoIcon: {
      width: spacing["26"],
      borderRadius: spacing["26"],
      height: spacing["26"],
    },
    btnAcc: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: spacing["2"],
    },
    containerInfoAccount: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    getStarted: {
      borderRadius: 999,
      width: metrics.screenWidth / 2.45,
      height: 32,
    },
    copy: {
      borderRadius: 999,
      width: metrics.screenWidth / 3,
      height: 32,
    },
    btnGroup: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    containerLoading: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      top: 30,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
  });
