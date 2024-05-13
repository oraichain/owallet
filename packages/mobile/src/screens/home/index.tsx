import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  //@ts-ignore
  useTransition,
} from "react";
import {
  PageWithScrollView,
  PageWithScrollViewInBottomTabView,
  PageWithViewInBottomTabView,
} from "../../components/page";
import { AccountCard } from "./account-card";
import {
  AppState,
  AppStateStatus,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { usePrevious } from "../../hooks";
import { useTheme } from "@src/themes/theme-provider";
import { useFocusEffect } from "@react-navigation/native";
import { ChainUpdaterService } from "@owallet/background";
import { getBase58Address, ChainIdEnum } from "@owallet/common";
import { TokensCardAll } from "./tokens-card-all";
import { AccountBoxAll } from "./account-box-new";
import { oraichainNetwork } from "@oraichain/oraidex-common";
import { useCoinGeckoPrices, useLoadTokens } from "@owallet/hooks";
import { showToast } from "@src/utils/helper";
import { EarningCardNew } from "./earning-card-new";
import { InjectedProviderUrl } from "../web/config";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonPageHeader } from "@src/components/header/common-header";

export const HomeScreen: FunctionComponent = observer((props) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshDate, setRefreshDate] = React.useState(Date.now());
  const safeAreaInsets = useSafeAreaInsets();

  const { colors } = useTheme();
  const [isPending, startTransition] = useTransition();

  const styles = styling(colors);
  const {
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    browserStore,
    appInitStore,
    universalSwapStore,
    keyRingStore,
  } = useStore();

  const scrollViewRef = useRef<ScrollView | null>(null);

  const currentChain = chainStore.current;
  const currentChainId = currentChain?.chainId;
  const account = accountStore.getAccount(chainStore.current.chainId);

  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(
    chainStoreIsInitializing,
    true
  );

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      fetch(InjectedProviderUrl)
        .then((res) => {
          return res.text();
        })
        .then((res) => {
          browserStore.update_inject(res);
        })
        .catch((err) => console.log(err));
    });
  }, []);

  const checkAndUpdateChainInfo = useCallback(() => {
    if (!chainStoreIsInitializing) {
      (async () => {
        const result = await ChainUpdaterService.checkChainUpdate(currentChain);

        // TODO: Add the modal for explicit chain update.
        if (result.slient) {
          chainStore.tryUpdateChain(currentChainId);
        }
      })();
    }
  }, [chainStore, chainStoreIsInitializing, currentChain, currentChainId]);

  useEffect(() => {
    const appStateHandler = (state: AppStateStatus) => {
      if (state === "active") {
        checkAndUpdateChainInfo();
      }
    };
    const subscription = AppState.addEventListener("change", appStateHandler);
    return () => {
      subscription.remove();
    };
  }, [checkAndUpdateChainInfo]);

  useFocusEffect(
    useCallback(() => {
      if (
        (chainStoreIsInitializing !== previousChainStoreIsInitializing &&
          !chainStoreIsInitializing) ||
        currentChainId !== previousChainId
      ) {
        checkAndUpdateChainInfo();
      }
    }, [
      chainStoreIsInitializing,
      previousChainStoreIsInitializing,
      currentChainId,
      previousChainId,
      checkAndUpdateChainInfo,
    ])
  );

  const onRefresh = React.useCallback(async () => {
    const queries = queriesStore.get(chainStore.current.chainId);
    if (chainStore.current.chainId === ChainIdEnum.TRON) {
      await queries.tron.queryAccount
        .getQueryWalletAddress(getBase58Address(account.evmosHexAddress))
        .waitFreshResponse();
      setRefreshing(false);
      setRefreshDate(Date.now());
      return;
    }
    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.
    if (chainStore.current.networkType === "bitcoin") {
      await queries.bitcoin.queryBitcoinBalance
        .getQueryBalance(account.bech32Address)
        .waitFreshResponse();
      setRefreshing(false);
      setRefreshDate(Date.now());
      return;
    } else {
      await Promise.all([
        priceStore.waitFreshResponse(),
        ...queries.queryBalances
          .getQueryBech32Address(account.bech32Address)
          .balances.map((bal) => {
            return bal.waitFreshResponse();
          }),
        // queries.cosmos.queryRewards
        //   .getQueryBech32Address(account.bech32Address)
        //   .waitFreshResponse(),
        // queries.cosmos.queryDelegations
        //   .getQueryBech32Address(account.bech32Address)
        //   .waitFreshResponse(),
        // queries.cosmos.queryUnbondingDelegations
        //   .getQueryBech32Address(account.bech32Address)
        //   .waitFreshResponse(),
      ]);
    }
    setRefreshing(false);
    setRefreshDate(Date.now());
    if (
      accountOrai.bech32Address &&
      accountEth.evmosHexAddress &&
      accountTron.evmosHexAddress &&
      accountKawaiiCosmos.bech32Address
    ) {
      const currentDate = Date.now();
      const differenceInMilliseconds = Math.abs(currentDate - refreshDate);
      const differenceInSeconds = differenceInMilliseconds / 1000;
      let timeoutId: NodeJS.Timeout;
      if (differenceInSeconds > 10) {
        universalSwapStore.setLoaded(false);
        onFetchAmount();
      } else {
        console.log("The dates are 10 seconds or less apart.");
      }
    }
  }, [
    chainStore.current.chainId,
    refreshDate,
    universalSwapStore.getTokenReload,
  ]);

  // This section for getting all tokens of all chains

  const accountOrai = accountStore.getAccount(ChainIdEnum.Oraichain);
  const accountEth = accountStore.getAccount(ChainIdEnum.Ethereum);
  const accountTron = accountStore.getAccount(ChainIdEnum.TRON);
  const accountKawaiiCosmos = accountStore.getAccount(ChainIdEnum.KawaiiCosmos);

  const loadTokenAmounts = useLoadTokens(universalSwapStore);

  // handle fetch all tokens of all chains
  const handleFetchAmounts = async (params: {
    orai?: string;
    eth?: string;
    tron?: string;
    kwt?: string;
  }) => {
    const { orai, eth, tron, kwt } = params;

    let loadTokenParams = {};
    try {
      const cwStargate = {
        account: accountOrai,
        chainId: ChainIdEnum.Oraichain,
        rpc: oraichainNetwork.rpc,
      };

      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: orai ?? accountOrai.bech32Address,
        metamaskAddress: eth ?? null,
        kwtAddress: kwt ?? accountKawaiiCosmos.bech32Address,
        tronAddress: tron ?? null,
        cwStargate,
        tokenReload:
          universalSwapStore?.getTokenReload?.length > 0
            ? universalSwapStore.getTokenReload
            : null,
      };

      loadTokenAmounts(loadTokenParams);
      universalSwapStore.clearTokenReload();
    } catch (error) {
      console.log("error loadTokenAmounts", error);
      showToast({
        message: error?.message ?? error?.ex?.message,
        type: "danger",
      });
    }
  };

  useEffect(() => {
    universalSwapStore.setLoaded(false);
  }, [accountOrai.bech32Address]);

  const onFetchAmount = () => {
    let timeoutId;
    if (accountOrai.isNanoLedger) {
      if (Object.keys(keyRingStore.keyRingLedgerAddresses).length > 0) {
        timeoutId = setTimeout(() => {
          handleFetchAmounts({
            orai: accountOrai.bech32Address,
            eth: keyRingStore.keyRingLedgerAddresses.eth ?? null,
            tron: keyRingStore.keyRingLedgerAddresses.trx ?? null,
            kwt: accountKawaiiCosmos.bech32Address,
          });
        }, 800);
      }
    } else if (
      accountOrai.bech32Address &&
      accountEth.evmosHexAddress &&
      accountTron.evmosHexAddress &&
      accountKawaiiCosmos.bech32Address
    ) {
      timeoutId = setTimeout(() => {
        handleFetchAmounts({
          orai: accountOrai.bech32Address,
          eth: accountEth.evmosHexAddress,
          tron: getBase58Address(accountTron.evmosHexAddress),
          kwt: accountKawaiiCosmos.bech32Address,
        });
      }, 1000);
    }

    return timeoutId;
  };

  useEffect(() => {
    let timeoutId;
    InteractionManager.runAfterInteractions(() => {
      startTransition(() => {
        timeoutId = onFetchAmount();
      });
    });
    // Clean up the timeout if the component unmounts or the dependency changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [accountOrai.bech32Address]);

  const { data: prices } = useCoinGeckoPrices();

  useEffect(() => {
    appInitStore.updatePrices(prices);
  }, [prices]);

  const renderNewAccountCard = (() => {
    return <AccountBoxAll />;
  })();

  return (
    <PageWithScrollViewInBottomTabView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.containerStyle}
      ref={scrollViewRef}
    >
      {renderNewAccountCard}

      {chainStore.current.networkType === "cosmos" &&
      !appInitStore.getInitApp.isAllNetworks ? (
        <EarningCardNew containerStyle={styles.containerEarnStyle} />
      ) : null}
      <TokensCardAll />
    </PageWithScrollViewInBottomTabView>
  );
});

const styling = (colors) =>
  StyleSheet.create({
    containerStyle: {
      paddingBottom: 12,
      backgroundColor: colors["neutral-surface-bg2"],
      paddingTop: 30,
    },
    containerEarnStyle: {
      backgroundColor: colors["neutral-surface-bg2"],
    },
  });
