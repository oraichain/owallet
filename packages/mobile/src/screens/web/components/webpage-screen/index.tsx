import { Ethereum, OWallet, TronWeb } from '@owallet/provider';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import EventEmitter from 'eventemitter3';
import { observer } from 'mobx-react-lite';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { useTheme } from '@src/themes/theme-provider';
import { Animated, BackHandler, Platform, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { URL } from 'react-native-url-polyfill';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { version } from '../../../../../package.json';
import { PageWithView } from '../../../../components/page';
import {
  RNInjectedEthereum,
  RNInjectedOWallet,
  RNInjectedTronWeb
} from '../../../../injected/injected-provider';
import { RNMessageRequesterExternal } from '../../../../router';
import { useStore } from '../../../../stores';
import { InjectedProviderUrl } from '../../config';
import { WebViewStateContext } from '../context';
import { BrowserFooterSection } from '../footer-section';
import { OnScreenWebpageScreenHeader } from '../header';
import { SwtichTab } from '../switch-tabs';

export const useInjectedSourceCode = () => {
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    fetch(`${InjectedProviderUrl}/injected-provider-merge.bundle.js`)
      .then(res => {
        return res.text();
      })
      .then(res => {
        setCode(res);
      })
      .catch(err => console.log(err));
  }, []);

  return code;
};

export const WebpageScreen: FunctionComponent<
  React.ComponentProps<typeof WebView> & {
    name: string;
  }
> = observer(props => {
  const { keyRingStore, chainStore, browserStore } = useStore();
  const { colors } = useTheme();
  const bottomHeight = 80;
  const [pageLoaded, setLoaded] = useState(false);
  const [isSwitchTab, setIsSwitchTab] = useState(false);
  // const scrollY = new Animated.Value(0);
  // const diffClamp = Animated.diffClamp(scrollY, 0, bottomHeight);
  // const translateYBottom = diffClamp.interpolate({
  //   inputRange: [0, 0.1],
  //   outputRange: [-0.1, 0]
  // });

  const webviewRef = useRef<WebView | null>(null);
  const [currentURL, setCurrentURL] = useState(() => {
    if (props.source && 'uri' in props.source) {
      return props.source.uri;
    }

    return '';
  });

  const [owallet] = useState(
    () =>
      new OWallet(
        version,
        'core',
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error('Webview not initialized yet');
          }

          if (!currentURL) {
            throw new Error('Current URL is empty');
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin
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

          if (!currentURL) {
            throw new Error('Current URL is empty');
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin
          };
        })
      )
  );

  const [tronWeb] = useState(
    () =>
      new TronWeb(
        version,
        'core',
        chainStore.current.chainId,
        new RNMessageRequesterExternal(() => {
          if (!webviewRef.current) {
            throw new Error('Webview not initialized yet');
          }

          if (!currentURL) {
            throw new Error('Current URL is empty');
          }

          return {
            url: currentURL,
            origin: new URL(currentURL).origin
          };
        })
      )
  );

  const onPressItem = ({ name, uri }) => {
    setIsSwitchTab(false);
    if (browserStore.getSelectedTab?.uri !== uri) {
      browserStore.updateSelectedTab({ id: Date.now(), name, uri });
      navigation.navigate('Web.dApp', {
        id: Date.now(),
        name,
        uri
      });
    }
  };

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
            window.postMessage(${JSON.stringify(
              message
            )}, window.location.origin);
            true; // note: this is required, or you'll sometimes get silent failures
          `
      );
    }
  };

  const handleWebViewLoaded = () => {
    setLoaded(true);
  };

  // Start proxy for webview
  useEffect(() => {
    RNInjectedOWallet.startProxy(
      owallet,
      eventListener,
      RNInjectedOWallet.parseWebviewMessage
    );
  }, [eventEmitter, owallet]);

  useEffect(() => {
    RNInjectedEthereum.startProxy(
      ethereum,
      eventListener,
      RNInjectedEthereum.parseWebviewMessage
    );
  }, [eventEmitter, ethereum]);

  useEffect(() => {
    RNInjectedTronWeb.startProxy(
      tronWeb,
      eventListener,
      RNInjectedTronWeb.parseWebviewMessage
    );
  }, [eventEmitter, tronWeb]);

  useEffect(() => {
    const keyStoreChangedListener = () => {
      webviewRef.current?.injectJavaScript(
        `
            window.dispatchEvent(new Event("keplr_keystorechange"));
            true; // note: this is required, or you'll sometimes get silent failures
          `
      );
    };

    keyRingStore.addKeyStoreChangedListener(keyStoreChangedListener);

    return () => {
      keyRingStore.removeKeyStoreChangedListener(keyStoreChangedListener);
    };
  }, [keyRingStore]);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const isFocused = useIsFocused();
  useEffect(() => {
    // Handle the hardware back button on the android.
    const backHandler = () => {
      if (!isFocused || webviewRef.current == null) {
        return false;
      }

      if (!canGoBack) {
        return false;
      }

      webviewRef.current.goBack();
      return true;
    };

    if (isFocused) {
      BackHandler.addEventListener('hardwareBackPress', backHandler);
    }

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };
  }, [canGoBack, isFocused]);

  const navigation = useNavigation();

  useEffect(() => {
    // Android disables the gesture by default.
    // If we turn on the gesture manually without checking OS,
    // the gesture will turn on even on Android.
    // So, checking platform is required.
    if (Platform.OS === 'ios') {
      navigation.setOptions({
        gestureEnabled: !canGoBack
      });
    }
  }, [canGoBack, navigation]);

  // const _onScroll = syntheticEvent => {
  //   const currentOffet = syntheticEvent.nativeEvent.contentOffset.y;
  //   scrollY.setValue(currentOffet);
  // };

  const sourceCode = useInjectedSourceCode();

  // const sourceCode = `
  // var sc = document.createElement("script");
  // sc.setAttribute("src", "${InjectedProviderUrl}/injected-provider.bundle.js");
  // sc.setAttribute("type", "text/javascript");
  // document.head.appendChild(sc);
  // `;

  return (
    <PageWithView backgroundColor={colors['background']} disableSafeArea>
      {isSwitchTab ? (
        <>
          <SwtichTab onPressItem={onPressItem} />
          <WebViewStateContext.Provider
            value={{
              webView: webviewRef.current,
              name: props.name,
              url: currentURL,
              canGoBack,
              canGoForward,
              clearWebViewContext: () => {
                webviewRef.current = null;
              }
            }}
          >
            <BrowserFooterSection
              isSwitchTab={isSwitchTab}
              setIsSwitchTab={setIsSwitchTab}
              typeOf={'webview'}
            />
          </WebViewStateContext.Provider>
        </>
      ) : (
        <>
          <WebViewStateContext.Provider
            value={{
              webView: webviewRef.current,
              name: props.name,
              url: currentURL,
              canGoBack,
              canGoForward,
              clearWebViewContext: () => {
                webviewRef.current = null;
              }
            }}
          >
            <OnScreenWebpageScreenHeader />
          </WebViewStateContext.Provider>
          {sourceCode ? (
            <>
              <WebView
                ref={webviewRef}
                incognito={true}
                style={pageLoaded ? {} : { flex: 0, height: 0, opacity: 0 }}
                containerStyle={{ marginBottom: bottomHeight }}
                // cacheEnabled={true}
                injectedJavaScriptBeforeContentLoaded={sourceCode}
                onLoad={handleWebViewLoaded}
                onMessage={onMessage}
                onNavigationStateChange={e => {
                  // Strangely, `onNavigationStateChange` is only invoked whenever page changed only in IOS.
                  // Use two handlers to measure simultaneously in ios and android.
                  setCanGoBack(e.canGoBack);
                  setCanGoForward(e.canGoForward);

                  setCurrentURL(e.url);
                }}
                onLoadProgress={e => {
                  // Strangely, `onLoadProgress` is only invoked whenever page changed only in Android.
                  // Use two handlers to measure simultaneously in ios and android.
                  setCanGoBack(e.nativeEvent.canGoBack);
                  setCanGoForward(e.nativeEvent.canGoForward);

                  setCurrentURL(e.nativeEvent.url);
                }}
                contentInsetAdjustmentBehavior="never"
                automaticallyAdjustContentInsets={false}
                decelerationRate="normal"
                allowsBackForwardNavigationGestures={true}
                // onScroll={_onScroll}
                {...props}
              />
              <WebViewStateContext.Provider
                value={{
                  webView: webviewRef.current,
                  name: props.name,
                  url: currentURL,
                  canGoBack,
                  canGoForward,
                  clearWebViewContext: () => {
                    webviewRef.current = null;
                  }
                }}
              >
                {/* <Animated.View
                  style={{
                    transform: [{ translateY: translateYBottom }]
                  }}
                > */}
                <View>
                  <BrowserFooterSection
                    isSwitchTab={isSwitchTab}
                    setIsSwitchTab={setIsSwitchTab}
                    typeOf={'webview'}
                  />
                </View>
                {/* </Animated.View> */}
              </WebViewStateContext.Provider>
            </>
          ) : null}
        </>
      )}
    </PageWithView>
  );
});

export * from './screen-options';
