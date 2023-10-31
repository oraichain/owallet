import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { PageWithScrollViewInBottomTabView } from '../../components/page';
import { Text } from '@src/components/text';
import { useTheme } from '@src/themes/theme-provider';
import { observer } from 'mobx-react-lite';
import { RefreshControl, View } from 'react-native';
import { useStore } from '../../stores';
import { SwapBox } from './components/SwapBox';
import { OWButton } from '@src/components/button';
import OWButtonIcon from '@src/components/button/ow-button-icon';
import { BalanceText } from './components/BalanceText';
import { SelectNetworkModal, SelectTokenModal, SlippageModal } from './modals/';
import { isAndroid, showToast } from '@src/utils/helper';
import { useCoinGeckoPrices } from '@src/hooks/use-coingecko';
import {
  DEFAULT_SLIPPAGE,
  GAS_ESTIMATION_SWAP_DEFAULT,
  ORAI,
  TRON_ID,
  ETH_ID,
  KAWAII_ID,
  ORAICHAIN_ID,
  toDisplay
} from '@owallet/common';
import { Address } from '@owallet/crypto';
import useLoadTokens from '@src/hooks/use-load-tokens';
import { evmTokens } from '@owallet/common';
import { TokenItemType, NetworkChainId, oraichainNetwork, tokenMap, toAmount } from '@oraichain/oraidex-common';
import {
  SwapDirection,
  calculateMinimum,
  feeEstimate,
  fetchTaxRate,
  filterTokens,
  getTokenOnSpecificChainId,
  getTransferTokenFee,
  handleSimulateSwap
} from '@owallet/common';
import { fetchTokenInfos, toSubAmount } from '@owallet/common';
import { CWStargate } from '@src/common/cw-stargate';
import { calculateMinReceive, getTokenOnOraichain } from '@oraichain/oraidex-common';
import {
  isEvmNetworkNativeSwapSupported,
  isEvmSwappable,
  isSupportedNoPoolSwapEvm,
  UniversalSwapData,
  UniversalSwapHandler
} from '@oraichain/oraidex-universal-swap';
import { SwapCosmosWallet, SwapEvmWallet } from './wallet';
import DeviceInfo from 'react-native-device-info';
import { Ethereum, OWallet } from '@owallet/provider';
import { RNMessageRequesterExternal } from '@src/router';
import { styling } from './styles';
import { BalanceType, MAX, balances, oraidexURL } from './types';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { EventEmitter } from 'eventemitter3';
import { RNInjectedEthereum } from '@src/injected/injected-provider';
import { useInjectedSourceCode } from '../web/components/webpage-screen';
import { WebViewStateContext } from '../web/components/context';

export const UniversalSwapScreen: FunctionComponent = observer(() => {
  const { accountStore, universalSwapStore, chainStore, keyRingStore } = useStore();
  const { colors } = useTheme();
  const { data: prices } = useCoinGeckoPrices();
  const chainId = chainStore?.current?.chainId;

  const account = accountStore.getAccount(chainId);
  const accountEvm = accountStore.getAccount(ETH_ID);
  const accountTron = accountStore.getAccount(TRON_ID);
  const accountOrai = accountStore.getAccount(ORAICHAIN_ID);

  const [isSlippageModal, setIsSlippageModal] = useState(false);
  const [minimumReceive, setMininumReceive] = useState(0);
  const [userSlippage, setUserSlippage] = useState(DEFAULT_SLIPPAGE);
  const [swapLoading, setSwapLoading] = useState(false);
  const [amountLoading, setAmountLoading] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [searchTokenName, setSearchTokenName] = useState('');
  const [filteredToTokens, setFilteredToTokens] = useState([] as TokenItemType[]);
  const [filteredFromTokens, setFilteredFromTokens] = useState([] as TokenItemType[]);
  const webviewRef = useRef<WebView | null>(null);

  const [[fromTokenDenom, toTokenDenom], setSwapTokens] = useState<[string, string]>(['orai', 'usdt']);

  const [[fromTokenInfoData, toTokenInfoData], setTokenInfoData] = useState<TokenItemType[]>([]);

  const [fromTokenFee, setFromTokenFee] = useState<number>(0);
  const [toTokenFee, setToTokenFee] = useState<number>(0);

  const [[fromAmountToken, toAmountToken], setSwapAmount] = useState([0, 0]);

  const [ratio, setRatio] = useState(null);

  const [client, setClient] = useState(null);

  const [balanceActive, setBalanceActive] = useState<BalanceType>(null);

  const getClient = async () => {
    const cwClient = await CWStargate.init(accountOrai, ORAICHAIN_ID, oraichainNetwork.rpc);
    setClient(cwClient);
  };

  useEffect(() => {
    getClient();
  }, []);

  const onChangeFromAmount = (amount: string | undefined) => {
    if (!amount) return setSwapAmount([undefined, toAmountToken]);
    setSwapAmount([parseFloat(amount), toAmountToken]);
  };

  const onMaxFromAmount = (amount: bigint, type: string) => {
    const displayAmount = toDisplay(amount, originalFromToken?.decimals);
    let finalAmount = displayAmount;

    // hardcode fee when swap token orai
    if (fromTokenDenom === ORAI) {
      const estimatedFee = feeEstimate(originalFromToken, GAS_ESTIMATION_SWAP_DEFAULT);
      const fromTokenBalanceDisplay = toDisplay(fromTokenBalance, originalFromToken?.decimals);
      if (type === MAX) {
        finalAmount = estimatedFee > displayAmount ? 0 : displayAmount - estimatedFee;
      } else {
        finalAmount = estimatedFee > fromTokenBalanceDisplay - displayAmount ? 0 : displayAmount;
      }
    }
    setSwapAmount([finalAmount, toAmountToken]);
  };

  // get token on oraichain to simulate swap amount.
  const originalFromToken = tokenMap[fromTokenDenom];
  const originalToToken = tokenMap[toTokenDenom];
  const isEvmSwap = isEvmSwappable({
    fromChainId: originalFromToken.chainId,
    toChainId: originalToToken.chainId,
    fromContractAddr: originalFromToken.contractAddress,
    toContractAddr: originalToToken.contractAddress
  });

  // if evm swappable then no need to get token on oraichain because we can swap on evm. Otherwise, get token on oraichain. If cannot find => fallback to original token
  const fromToken = isEvmSwap
    ? tokenMap[fromTokenDenom]
    : getTokenOnOraichain(tokenMap[fromTokenDenom].coinGeckoId) ?? tokenMap[fromTokenDenom];
  const toToken = isEvmSwap
    ? tokenMap[toTokenDenom]
    : getTokenOnOraichain(tokenMap[toTokenDenom].coinGeckoId) ?? tokenMap[toTokenDenom];

  const getTokenFee = async (
    remoteTokenDenom: string,
    fromChainId: NetworkChainId,
    toChainId: NetworkChainId,
    type: 'from' | 'to'
  ) => {
    // since we have supported evm swap, tokens that are on the same supported evm chain id don't have any token fees (because they are not bridged to Oraichain)
    if (isEvmNetworkNativeSwapSupported(fromChainId) && fromChainId === toChainId) return;
    if (remoteTokenDenom) {
      let tokenFee = 0;
      const ratio = await getTransferTokenFee({ remoteTokenDenom, client });

      if (ratio) {
        tokenFee = (ratio.nominator / ratio.denominator) * 100;
      }

      if (type === 'from') {
        setFromTokenFee(tokenFee);
      } else {
        setToTokenFee(tokenFee);
      }
    }
  };

  useEffect(() => {
    getTokenFee(originalToToken.prefix + originalToToken.contractAddress, fromToken.chainId, toToken.chainId, 'to');
  }, [originalToToken, fromToken, toToken, originalToToken]);

  useEffect(() => {
    getTokenFee(
      originalFromToken.prefix + originalFromToken.contractAddress,
      fromToken.chainId,
      toToken.chainId,
      'from'
    );
  }, [originalToToken, fromToken, toToken, originalToToken]);

  const getTokenInfos = async () => {
    const data = await fetchTokenInfos([fromToken!, toToken!], client);
    setTokenInfoData(data);
    return;
  };

  useEffect(() => {
    getTokenInfos();
  }, [toTokenDenom, fromTokenDenom]);

  const [isSelectFromTokenModal, setIsSelectFromTokenModal] = useState(false);
  const [isSelectToTokenModal, setIsSelectToTokenModal] = useState(false);
  const [isNetworkModal, setIsNetworkModal] = useState(false);
  const styles = styling(colors);

  const loadTokenAmounts = useLoadTokens(universalSwapStore);
  // handle fetch all tokens of all chains
  const handleFetchAmounts = async () => {
    const accounts = await Promise.all([
      accountStore.getAccount(ETH_ID),
      accountStore.getAccount(TRON_ID),
      accountStore.getAccount(KAWAII_ID)
    ]);
    let loadTokenParams = {};
    try {
      const cwStargate = {
        account: accountOrai,
        chainId: accountOrai.chainId,
        rpc: oraichainNetwork.rpc
      };

      loadTokenParams = {
        ...loadTokenParams,
        oraiAddress: accountOrai.bech32Address,
        cwStargate
      };
      accounts.map(async account => {
        if (account.chainId === ETH_ID) {
          loadTokenParams = {
            ...loadTokenParams,
            metamaskAddress: account.evmosHexAddress
          };
        }
        if (account.chainId === TRON_ID) {
          loadTokenParams = {
            ...loadTokenParams,
            tronAddress: Address.getBase58Address(account.evmosHexAddress)
          };
        }
        if (account.chainId === KAWAII_ID) {
          loadTokenParams = {
            ...loadTokenParams,
            kwtAddress: account.bech32Address
          };
        }
      });

      loadTokenAmounts(loadTokenParams);
    } catch (error) {
      console.log('error loadTokenAmounts', error);
    }
  };

  useEffect(() => {
    handleFetchAmounts();
    setTimeout(() => {
      handleFetchAmounts();
    }, 2000);
  }, []);

  const subAmountFrom = toSubAmount(universalSwapStore.getAmount, originalFromToken);
  const subAmountTo = toSubAmount(universalSwapStore.getAmount, originalToToken);
  const fromTokenBalance = originalFromToken
    ? BigInt(universalSwapStore.getAmount?.[originalFromToken.denom] ?? '0') + subAmountFrom
    : BigInt(0);

  const toTokenBalance = originalToToken
    ? BigInt(universalSwapStore.getAmount?.[originalToToken.denom] ?? '0') + subAmountTo
    : BigInt(0);

  useEffect(() => {
    const filteredToTokens = filterTokens(
      fromToken.chainId,
      fromToken.coinGeckoId,
      fromTokenDenom,
      searchTokenName,
      SwapDirection.To
    );
    setFilteredToTokens(filteredToTokens);

    const filteredFromTokens = filterTokens(
      toToken.chainId,
      toToken.coinGeckoId,
      toTokenDenom,
      searchTokenName,
      SwapDirection.From
    );
    setFilteredFromTokens(filteredFromTokens);

    // TODO: need to automatically update from / to token to the correct swappable one when clicking the swap button
  }, [fromToken, toToken, toTokenDenom, fromTokenDenom]);

  const getSimulateSwap = async (initAmount?) => {
    const data = await handleSimulateSwap(
      {
        fromInfo: fromTokenInfoData!,
        toInfo: toTokenInfoData!,
        originalFromInfo: originalFromToken,
        originalToInfo: originalToToken,
        amount: toAmount(initAmount ?? fromAmountToken, fromTokenInfoData!.decimals).toString()
      },
      client
    );
    setAmountLoading(false);
    return data;
  };

  const estimateAverageRatio = async () => {
    const data = await getSimulateSwap(1);
    setRatio(data);
  };

  const estimateSwapAmount = async fromAmountBalance => {
    setAmountLoading(true);
    try {
      const data = await getSimulateSwap();
      const minimumReceive = ratio?.amount
        ? calculateMinReceive(
            ratio.amount,
            toAmount(fromAmountToken, fromTokenInfoData!.decimals).toString(),
            userSlippage,
            originalFromToken.decimals
          )
        : '0';
      // const isWarningSlippage = +minimumReceive > +simulateData?.amount;
      setMininumReceive(toDisplay(minimumReceive));
      setSwapAmount([fromAmountBalance, Number(data.amount)]);
      setAmountLoading(false);
    } catch (error) {
      console.log('error', error);
      setAmountLoading(false);
    }
  };

  const [taxRate, setTaxRate] = useState('');

  const queryTaxRate = async () => {
    const data = await fetchTaxRate(client);
    setTaxRate(data?.rate);
  };

  useEffect(() => {
    queryTaxRate();
  }, []);

  useEffect(() => {
    estimateSwapAmount(fromAmountToken);
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken, fromAmountToken]);

  useEffect(() => {
    estimateAverageRatio();
  }, [originalFromToken, toTokenInfoData, fromTokenInfoData, originalToToken]);

  useEffect(() => {
    // special case for tokens having no pools on Oraichain. When original from token is not swappable, then we switch to an alternative token on the same chain as to token
    if (isSupportedNoPoolSwapEvm(toToken.coinGeckoId) && !isSupportedNoPoolSwapEvm(fromToken.coinGeckoId)) {
      const fromTokenSameToChainId = getTokenOnSpecificChainId(fromToken.coinGeckoId, toToken.chainId);
      if (!fromTokenSameToChainId) {
        const sameChainIdTokens = evmTokens.find(t => t.chainId === toToken.chainId);
        if (!sameChainIdTokens) throw Error('Impossible case! An EVM chain should at least have one token');
        setSwapTokens([sameChainIdTokens.denom, toToken.denom]);
        return;
      }
      setSwapTokens([fromTokenSameToChainId.denom, toToken.denom]);
    }
  }, [fromToken]);

  const handleBalanceActive = useCallback(
    (item: BalanceType) => {
      setBalanceActive(item);
    },
    [balanceActive]
  );

  const [eventEmitter] = useState(() => new EventEmitter());
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (__DEV__) {
        console.log('WebViewMessageEvent', event.nativeEvent.data);
      }

      eventEmitter.emit('message', event.nativeEvent);
    },
    [eventEmitter]
  );
  const eventListener = {
    addMessageListener: (fn: any) => {
      eventEmitter.addListener('message', fn);
    },
    postMessage: (message: any) => {
      webviewRef.current?.injectJavaScript(
        `
            window.postMessage(${JSON.stringify(message)}, window.location.origin);
            true; // note: this is required, or you'll sometimes get silent failures
          `
      );
    }
  };

  const [owallet] = useState(
    () =>
      new OWallet(
        DeviceInfo.getVersion(),
        'core',
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error('Webview not initialized yet');
          }

          if (!oraidexURL) {
            throw new Error('Current URL is empty');
          }

          return {
            url: oraidexURL,
            origin: new URL(oraidexURL).origin
          };
        })
      )
  );

  const [ethereum] = useState(
    () =>
      new Ethereum(
        DeviceInfo.getVersion(),
        'core',
        chainStore.current.chainId,
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error('Webview not initialized yet');
          }

          if (!oraidexURL) {
            throw new Error('Current URL is empty');
          }

          return {
            url: oraidexURL,
            origin: new URL(oraidexURL).origin
          };
        })
      )
  );

  useEffect(() => {
    RNInjectedEthereum.startProxy(ethereum, eventListener, RNInjectedEthereum.parseWebviewMessage);
  }, [eventEmitter, ethereum]);

  const handleSubmit = async () => {
    // account.handleUniversalSwap(chainId, { key: 'value' });
    // return;
    if (fromAmountToken <= 0) {
      showToast({
        text1: 'Error',
        text2: 'From amount should be higher than 0!',
        type: 'error'
      });
      return;
    }

    setSwapLoading(true);
    try {
      const cosmosWallet = new SwapCosmosWallet(client, owallet);
      const isTron = originalFromToken.coinGeckoId === 'tron';

      const evmWallet = new SwapEvmWallet(ethereum, accountEvm.evmosHexAddress, isTron, originalFromToken.rpc);

      const universalSwapData: UniversalSwapData = {
        sender: {
          cosmos: accountOrai.bech32Address,
          evm: accountEvm.evmosHexAddress,
          tron: Address.getBase58Address(accountTron.evmosHexAddress)
        },
        originalFromToken: originalFromToken,
        originalToToken: originalToToken,
        simulateAmount: toAmountToken.toString(),
        simulatePrice: ratio.amount,
        userSlippage: userSlippage,
        fromAmount: fromAmountToken
      };

      const universalSwapHandler = new UniversalSwapHandler(
        {
          ...universalSwapData
        },
        {
          cosmosWallet,
          //@ts-ignore
          evmWallet
        }
      );

      const result = await universalSwapHandler.processUniversalSwap();

      if (result) {
        setSwapLoading(false);
        showToast({
          text1: 'Success',
          type: 'success'
        });
        await handleFetchAmounts();
      }
    } catch (error) {
      setSwapLoading(false);
      console.log({ error });
      showToast({
        text1: 'Error',
        text2: JSON.stringify(error.message ?? 'Failed'),
        type: 'error'
      });
    } finally {
      setSwapLoading(false);
    }
  };

  const onRefresh = async () => {
    setLoadingRefresh(true);
    await handleFetchAmounts();
    setLoadingRefresh(false);
  };

  const handleReverseDirection = () => {
    if (isSupportedNoPoolSwapEvm(fromToken.coinGeckoId) && !isEvmNetworkNativeSwapSupported(toToken.chainId)) return;
    setSwapTokens([toTokenDenom, fromTokenDenom]);
    setSwapAmount([0, 0]);
    setBalanceActive(null);
    // setSwapAmount([toAmountToken, fromAmountToken]);
  };

  const handleActiveAmount = useCallback(
    item => {
      handleBalanceActive(item);
      onMaxFromAmount((fromTokenBalance * BigInt(item.value)) / BigInt(MAX), item.value);
    },
    [toAmountToken, toTokenBalance, originalFromToken, originalToToken, fromTokenBalance]
  );

  const sourceCode = useInjectedSourceCode();

  return (
    <PageWithScrollViewInBottomTabView
      backgroundColor={colors['plain-background']}
      style={[styles.container, isAndroid ? styles.pt30 : {}]}
      disableSafeArea={false}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loadingRefresh} onRefresh={onRefresh} />}
    >
      <WebViewStateContext.Provider
        value={{
          webView: webviewRef.current,
          name: '',
          url: oraidexURL,
          canGoBack: false,
          canGoForward: false,
          clearWebViewContext: () => {
            webviewRef.current = null;
          }
        }}
      >
        {sourceCode ? (
          <WebView
            ref={webviewRef}
            incognito={true}
            injectedJavaScriptBeforeContentLoaded={sourceCode}
            onMessage={onMessage}
            style={{ flex: 0, height: 0, width: 0, opacity: 0 }}
            source={{ uri: oraidexURL }}
          />
        ) : (
          <View />
        )}
      </WebViewStateContext.Provider>

      <SlippageModal
        close={() => {
          setIsSlippageModal(false);
        }}
        //@ts-ignore
        currentSlippage={userSlippage}
        isOpen={isSlippageModal}
        setUserSlippage={setUserSlippage}
      />
      <SelectTokenModal
        bottomSheetModalConfig={{
          snapPoints: ['50%', '90%'],
          index: 1
        }}
        prices={prices}
        data={filteredFromTokens}
        close={() => {
          setIsSelectFromTokenModal(false);
        }}
        onNetworkModal={() => {
          setIsNetworkModal(true);
        }}
        setToken={denom => {
          setSwapTokens([denom, toTokenDenom]);
          setSwapAmount([0, 0]);
          setBalanceActive(null);
        }}
        setSearchTokenName={setSearchTokenName}
        isOpen={isSelectFromTokenModal}
      />
      <SelectTokenModal
        bottomSheetModalConfig={{
          snapPoints: ['50%', '90%'],
          index: 1
        }}
        prices={prices}
        data={filteredToTokens}
        close={() => {
          setIsSelectToTokenModal(false);
        }}
        onNetworkModal={() => {
          setIsNetworkModal(true);
        }}
        setToken={denom => {
          setSwapTokens([fromTokenDenom, denom]);
          setSwapAmount([0, 0]);
          setBalanceActive(null);
        }}
        setSearchTokenName={setSearchTokenName}
        isOpen={isSelectToTokenModal}
      />
      {/* <SelectNetworkModal
        close={() => {
          setIsNetworkModal(false);
        }}
        isOpen={isNetworkModal}
      /> */}
      <View>
        <View style={styles.boxTop}>
          <Text color={colors['text-title-login']} variant="h3" weight="700">
            Universal Swap
          </Text>
          <OWButtonIcon
            isBottomSheet
            fullWidth={false}
            style={[styles.btnTitleRight]}
            sizeIcon={24}
            colorIcon={'#7C8397'}
            name="setting-bold"
            onPress={() => {
              setIsSlippageModal(true);
            }}
          />
        </View>

        <View>
          <SwapBox
            amount={fromAmountToken?.toString() ?? '0'}
            balanceValue={toDisplay(fromTokenBalance, originalFromToken?.decimals)}
            onChangeAmount={onChangeFromAmount}
            tokenActive={originalFromToken}
            onOpenTokenModal={() => setIsSelectFromTokenModal(true)}
            tokenFee={fromTokenFee}
          />
          <SwapBox
            amount={toDisplay(toAmountToken.toString()).toString() ?? '0'}
            balanceValue={toDisplay(toTokenBalance, originalToToken?.decimals)}
            tokenActive={originalToToken}
            onOpenTokenModal={() => setIsSelectToTokenModal(true)}
            editable={false}
            tokenFee={toTokenFee}
          />

          <View style={styles.containerBtnCenter}>
            <OWButtonIcon
              fullWidth={false}
              name="arrow_down_2"
              circle
              style={styles.btnSwapBox}
              colorIcon={'#7C8397'}
              sizeIcon={24}
              onPress={handleReverseDirection}
            />
          </View>
        </View>
        <View style={styles.containerBtnBalance}>
          {balances.map((item, index) => {
            return (
              <OWButton
                key={item.id ?? index}
                size="small"
                disabled={amountLoading || swapLoading}
                style={balanceActive?.id === item.id ? styles.btnBalanceActive : styles.btnBalanceInactive}
                textStyle={balanceActive?.id === item.id ? styles.textBtnBalanceAtive : styles.textBtnBalanceInActive}
                label={`${item.value}%`}
                fullWidth={false}
                onPress={() => handleActiveAmount(item)}
              />
            );
          })}
        </View>
        <OWButton
          label="Swap"
          style={styles.btnSwap}
          disabled={amountLoading || swapLoading}
          loading={swapLoading}
          textStyle={styles.textBtnSwap}
          onPress={handleSubmit}
        />
        <View style={styles.containerInfoToken}>
          <View style={styles.itemBottom}>
            <BalanceText>Quote</BalanceText>
            <BalanceText>
              {`1 ${originalFromToken?.name} ≈ ${toDisplay(
                ratio?.amount,
                fromTokenInfoData?.decimals,
                toTokenInfoData?.decimals
              )} ${originalToToken?.name}`}
            </BalanceText>
          </View>
          <View style={styles.itemBottom}>
            <BalanceText>Minimum Amount</BalanceText>
            <BalanceText>{(fromToken.minAmountSwap || '0') + ' ' + fromToken.name}</BalanceText>
          </View>
          <View style={styles.itemBottom}>
            <BalanceText>Minimum Receive</BalanceText>
            <BalanceText>{(minimumReceive || '0') + ' ' + toToken.name}</BalanceText>
          </View>
          {(!fromTokenFee && !toTokenFee) || (fromTokenFee === 0 && toTokenFee === 0) ? (
            <View style={styles.itemBottom}>
              <BalanceText>Tax rate</BalanceText>
              <BalanceText>{Number(taxRate) * 100}%</BalanceText>
            </View>
          ) : null}
          <View style={styles.itemBottom}>
            <BalanceText>Slippage</BalanceText>
            <BalanceText>{userSlippage}%</BalanceText>
          </View>
        </View>
      </View>
    </PageWithScrollViewInBottomTabView>
  );
});