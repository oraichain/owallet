import {
  KeyRingStore,
  InteractionStore,
  QueriesStore,
  CoinGeckoPriceStore,
  AccountStore,
  SignInteractionStore,
  TokensStore,
  QueriesWrappedTron,
  AccountWithAll,
  LedgerInitStore,
  IBCCurrencyRegsitrar,
  PermissionStore,
} from "@owallet/stores";
import { AsyncKVStore } from "../common";
import { APP_PORT } from "@owallet/router";
import { ChainInfoWithEmbed } from "@owallet/background";
import { RNEnv, RNRouterUI, RNMessageRequesterInternal } from "../router";
import { ChainStore } from "./chain";
import { BrowserStore, browserStore } from "./browser";
import { AppInit, appInit } from "./app_init";
import { Notification, notification } from "./notification";
import EventEmitter from "eventemitter3";
import { OWallet, Ethereum, Bitcoin, TronWeb } from "@owallet/provider";
import { KeychainStore } from "./keychain";
import { FeeType } from "@owallet/hooks";
import {
  EmbedChainInfos,
  UIConfigStore,
  FiatCurrencies,
} from "@owallet/common";
import { AnalyticsStore, NoopAnalyticsClient } from "@owallet/analytics";
import { ChainIdHelper } from "@owallet/cosmos";
import { FiatCurrency } from "@owallet/types";
import { ModalStore } from "./modal";
import { version, name } from "../../package.json";
import { SendStore } from "./send";
import { ChainInfoInner } from "@owallet/stores";
import { ChainInfo } from "@owallet/types";
import { TxsStore } from "./txs";
import { universalSwapStore, UniversalSwapStore } from "./universal_swap";
import { HugeQueriesStore } from "@src/stores/huge-queries";
import { WalletConnectStore } from "./wallet-connect";
import { DeepLinkStore } from "@stores/deep-link";
export class RootStore {
  public readonly uiConfigStore: UIConfigStore;
  public readonly chainStore: ChainStore;
  public readonly keyRingStore: KeyRingStore;

  protected readonly interactionStore: InteractionStore;
  public readonly permissionStore: PermissionStore;
  public readonly ledgerInitStore: LedgerInitStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly hugeQueriesStore: HugeQueriesStore;
  public readonly walletConnectStore: WalletConnectStore;
  public readonly queriesStore: QueriesStore<QueriesWrappedTron>;
  public readonly accountStore: AccountStore<AccountWithAll>;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly tokensStore: TokensStore;

  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithEmbed>;

  public readonly keychainStore: KeychainStore;

  public readonly analyticsStore: AnalyticsStore<
    {
      chainId?: string;
      chainName?: string;
      toChainId?: string;
      toChainName?: string;
      registerType?: "seed" | "google" | "apple" | "ledger" | "qr";
      feeType?: FeeType | undefined;
      isIbc?: boolean;
      validatorName?: string;
      toValidatorName?: string;
      proposalId?: string;
      proposalTitle?: string;
    },
    {
      registerType?: "seed" | "google" | "ledger" | "qr" | "apple";
      accountType?: "mnemonic" | "privateKey" | "ledger";
      currency?: string;
      language?: string;
    }
  >;

  public readonly deepLinkUriStore: DeepLinkStore;
  public readonly browserStore: BrowserStore;
  public readonly modalStore: ModalStore;
  public readonly sendStore: SendStore;
  public readonly appInitStore: AppInit;
  public readonly universalSwapStore: UniversalSwapStore;
  public readonly notificationStore: Notification;
  public readonly txsStore: (
    currentChain: ChainInfoInner<ChainInfo>
  ) => TxsStore;

  constructor() {
    const router = new RNRouterUI(RNEnv.produceEnv);

    const eventEmitter = new EventEmitter();

    this.uiConfigStore = new UIConfigStore(new AsyncKVStore("store_ui_config"));

    // Order is important.
    this.interactionStore = new InteractionStore(
      router,
      new RNMessageRequesterInternal()
    );
    this.permissionStore = new PermissionStore(
      this.interactionStore,
      new RNMessageRequesterInternal()
    );
    this.ledgerInitStore = new LedgerInitStore(
      this.interactionStore,
      new RNMessageRequesterInternal()
    );
    this.signInteractionStore = new SignInteractionStore(this.interactionStore);

    this.chainStore = new ChainStore(
      EmbedChainInfos,
      new RNMessageRequesterInternal(),
      new AsyncKVStore("store_chains")
    );

    this.keyRingStore = new KeyRingStore(
      {
        dispatchEvent: (type: string) => {
          eventEmitter.emit(type);
        },
      },
      "pbkdf2",
      this.chainStore,
      new RNMessageRequesterInternal(),
      this.interactionStore
    );

    this.queriesStore = new QueriesStore(
      // Fix prefix key because there was a problem with storage being corrupted.
      // In the case of storage where the prefix key is "store_queries" or "store_queries_fix", we should not use it because it is already corrupted in some users.

      new AsyncKVStore("store_queries_fix2"),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      async () => {
        return new OWallet(
          `${name}-${version}`,
          "core",
          new RNMessageRequesterInternal()
        );
      },
      QueriesWrappedTron
    );

    this.accountStore = new AccountStore<AccountWithAll>(
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
        removeEventListener: (type: string, fn: () => void) => {
          eventEmitter.removeListener(type, fn);
        },
      },
      AccountWithAll,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          prefetching: false,
          suggestChain: false,
          autoInit: true,
          getOWallet: async () => {
            return new OWallet(
              `${name}-${version}`,
              "core",
              new RNMessageRequesterInternal()
            );
          },
          getEthereum: async () => {
            return new Ethereum(
              version,
              "core",
              "0x38",
              new RNMessageRequesterInternal()
            );
          },
          getBitcoin: async () => {
            return new Bitcoin(
              version,
              "core",
              new RNMessageRequesterInternal()
            );
          },
          getTronWeb: async () => {
            return new TronWeb(
              version,
              "core",
              "0x2b6653dc",
              new RNMessageRequesterInternal()
            );
          },
        },
        chainOpts: this.chainStore.chainInfos.map((chainInfo) => {
          // In evm network, default gas for sending
          if (chainInfo.networkType.startsWith("evm")) {
            return {
              chainId: chainInfo.chainId,
              msgOpts: {
                send: {
                  native: {
                    gas: 21000,
                  },
                  erc20: {
                    gas: 21000,
                  },
                },
              },
            };
          }
          if (chainInfo.chainId.startsWith("osmosis")) {
            return {
              chainId: chainInfo.chainId,
              msgOpts: {
                withdrawRewards: {
                  gas: 400000,
                },
                send: {
                  native: {
                    gas: 400000,
                  },
                },
              },
            };
          }

          return { chainId: chainInfo.chainId };
        }),
      }
    );

    this.priceStore = new CoinGeckoPriceStore(
      new AsyncKVStore("store_prices"),
      FiatCurrencies.reduce<{
        [vsCurrency: string]: FiatCurrency;
      }>((obj, fiat) => {
        obj[fiat.currency] = fiat;
        return obj;
      }, {}),
      "usd"
    );

    // this.tokensStore = new TokensStore(
    //   {
    //     addEventListener: (type: string, fn: () => void) => {
    //       eventEmitter.addListener(type, fn);
    //     },
    //   },
    //   this.chainStore,
    //   new RNMessageRequesterInternal(),
    //   this.interactionStore
    // );
    this.tokensStore = new TokensStore(
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
      },
      this.chainStore,
      new RNMessageRequesterInternal(),
      this.interactionStore,
      this.accountStore,
      this.keyRingStore
    );
    this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar<ChainInfoWithEmbed>(
      new AsyncKVStore("store_test_ibc_currency_registrar"),
      24 * 3600 * 1000,
      this.chainStore,
      this.accountStore,
      this.queriesStore,
      this.queriesStore
    );

    router.listen(APP_PORT);

    this.keychainStore = new KeychainStore(
      new AsyncKVStore("store_keychain"),
      this.keyRingStore
    );

    this.analyticsStore = new AnalyticsStore(
      (() => {
        return new NoopAnalyticsClient();
      })(),
      {
        logEvent: (eventName, eventProperties) => {
          if (eventProperties?.chainId || eventProperties?.toChainId) {
            eventProperties = {
              ...eventProperties,
            };

            if (eventProperties.chainId) {
              eventProperties.chainId = ChainIdHelper.parse(
                eventProperties.chainId
              ).identifier;
            }

            if (eventProperties.toChainId) {
              eventProperties.toChainId = ChainIdHelper.parse(
                eventProperties.toChainId
              ).identifier;
            }
          }

          return {
            eventName,
            eventProperties,
          };
        },
      }
    );

    this.browserStore = browserStore;
    this.modalStore = new ModalStore();
    this.appInitStore = appInit;
    this.universalSwapStore = universalSwapStore;
    this.hugeQueriesStore = new HugeQueriesStore(
      this.chainStore,
      this.queriesStore,
      this.accountStore,
      this.priceStore,
      this.keyRingStore
    );
    this.walletConnectStore = new WalletConnectStore(
      new AsyncKVStore("store_wallet_connect_v2"),
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
        removeEventListener: (type: string, fn: () => void) => {
          eventEmitter.removeListener(type, fn);
        },
      },
      this.chainStore,
      this.keyRingStore,
      this.permissionStore
    );
    this.deepLinkUriStore = new DeepLinkStore(this.walletConnectStore);
    this.notificationStore = notification;
    this.sendStore = new SendStore();
    this.txsStore = (currentChain: ChainInfoInner<ChainInfo>): TxsStore =>
      new TxsStore(currentChain);
  }
}

export function createRootStore() {
  return new RootStore();
}
