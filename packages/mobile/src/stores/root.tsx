import {
  KeyRingStore,
  InteractionStore,
  QueriesStore,
  CoinGeckoPriceStore,
  AccountStore,
  SignInteractionStore,
  TokensStore,
  // QueriesWrappedTron,
  // AccountWithAll,
  LedgerInitStore,
  // IBCCurrencyRegsitrar,
  PermissionStore,
  CosmosAccount,
  CosmwasmAccount,
  SecretAccount,
  CosmosQueries,
  CosmwasmQueries,
  SecretQueries,
  OsmosisQueries,
  getOWalletFromWindow,
} from "@owallet/stores";
import { AsyncKVStore } from "../common";
import { APP_PORT } from "@owallet/router";
import { ChainInfoWithEmbed } from "@owallet/background";
import { RNEnv, RNRouterUI, RNMessageRequesterInternal } from "../router";
import { ChainStore } from "./chain";
import { DeepLinkStore, BrowserStore, browserStore } from "./browser";
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

export class RootStore {
  public readonly uiConfigStore: UIConfigStore;
  public readonly chainStore: ChainStore;
  public readonly keyRingStore: KeyRingStore;

  protected readonly interactionStore: InteractionStore;
  public readonly permissionStore: PermissionStore;
  public readonly ledgerInitStore: LedgerInitStore;
  public readonly signInteractionStore: SignInteractionStore;
  public readonly queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, SecretQueries, OsmosisQueries]
  >;
  public readonly accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, SecretAccount]
  >;
  public readonly hugeQueriesStore: HugeQueriesStore;
  // public readonly hugeQueriesNewStore: HugeQueriesNewStore;
  // public readonly queriesStore: QueriesStore<QueriesWrappedTron>;
  // public readonly accountStore: AccountStore<AccountWithAll>;
  public readonly priceStore: CoinGeckoPriceStore;
  public readonly tokensStore: TokensStore<ChainInfoWithEmbed>;

  // protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithEmbed>;

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
    this.accountStore = new AccountStore(
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
        removeEventListener: (type: string, fn: () => void) => {
          eventEmitter.removeListener(type, fn);
        },
      },
      this.chainStore,
      getOWalletFromWindow,
      () => {
        return {
          suggestChain: false,
          autoInit: true,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: (chainId) => {
          // In certik, change the msg type of the MsgSend to "bank/MsgSend"
          if (chainId.startsWith("shentu-")) {
            return {
              send: {
                native: {
                  type: "bank/MsgSend",
                },
              },
            };
          }

          // In akash or sifchain, increase the default gas for sending
          if (
            chainId.startsWith("akashnet-") ||
            chainId.startsWith("sifchain")
          ) {
            return {
              send: {
                native: {
                  gas: 120000,
                },
              },
            };
          }

          if (chainId.startsWith("secret-")) {
            return {
              send: {
                native: {
                  gas: 20000,
                },
              },
              withdrawRewards: {
                gas: 25000,
              },
            };
          }

          // For terra related chains
          if (
            chainId.startsWith("bombay-") ||
            chainId.startsWith("columbus-")
          ) {
            return {
              send: {
                native: {
                  type: "bank/MsgSend",
                },
              },
              withdrawRewards: {
                type: "distribution/MsgWithdrawDelegationReward",
              },
              delegate: {
                type: "staking/MsgDelegate",
              },
              undelegate: {
                type: "staking/MsgUndelegate",
              },
              redelegate: {
                type: "staking/MsgBeginRedelegate",
              },
            };
          }

          if (chainId.startsWith("evmos_") || chainId.startsWith("planq_")) {
            return {
              send: {
                native: {
                  gas: 140000,
                },
              },
              withdrawRewards: {
                gas: 200000,
              },
            };
          }

          if (chainId.startsWith("osmosis")) {
            return {
              send: {
                native: {
                  gas: 100000,
                },
              },
              withdrawRewards: {
                gas: 300000,
              },
            };
          }

          if (chainId.startsWith("stargaze-")) {
            return {
              send: {
                native: {
                  gas: 100000,
                },
              },
              withdrawRewards: {
                gas: 200000,
              },
            };
          }
        },
      }),
      CosmwasmAccount.use({
        queriesStore: this.queriesStore,
      }),
      SecretAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: (chainId) => {
          if (chainId.startsWith("secret-")) {
            return {
              send: {
                secret20: {
                  gas: 175000,
                },
              },
              createSecret20ViewingKey: {
                gas: 175000,
              },
            };
          }
        },
      })
    );
    // this.queriesStore = new QueriesStore(
    //   // Fix prefix key because there was a problem with storage being corrupted.
    //   // In the case of storage where the prefix key is "store_queries" or "store_queries_fix", we should not use it because it is already corrupted in some users.

    //   new AsyncKVStore("store_queries_fix2"),
    //   this.chainStore,
    //   async () => {
    //     return new OWallet(
    //       `${name}-${version}`,
    //       "core",
    //       new RNMessageRequesterInternal()
    //     );
    //   },
    //   QueriesWrappedTron
    // );

    // this.accountStore = new AccountStore<AccountWithAll>(
    //   {
    //     addEventListener: (type: string, fn: () => void) => {
    //       eventEmitter.addListener(type, fn);
    //     },
    //     removeEventListener: (type: string, fn: () => void) => {
    //       eventEmitter.removeListener(type, fn);
    //     },
    //   },
    //   AccountWithAll,
    //   this.chainStore,
    //   this.queriesStore,
    //   {
    //     defaultOpts: {
    //       prefetching: false,
    //       suggestChain: false,
    //       autoInit: true,
    //       getOWallet: async () => {
    //         return new OWallet(
    //           `${name}-${version}`,
    //           "core",
    //           new RNMessageRequesterInternal()
    //         );
    //       },
    //       getEthereum: async () => {
    //         return new Ethereum(
    //           version,
    //           "core",
    //           "0x38",
    //           new RNMessageRequesterInternal()
    //         );
    //       },
    //       getBitcoin: async () => {
    //         return new Bitcoin(
    //           version,
    //           "core",
    //           new RNMessageRequesterInternal()
    //         );
    //       },
    //       getTronWeb: async () => {
    //         return new TronWeb(
    //           version,
    //           "core",
    //           "0x2b6653dc",
    //           new RNMessageRequesterInternal()
    //         );
    //       },
    //     },
    //     chainOpts: this.chainStore.chainInfos.map((chainInfo) => {
    //       // In evm network, default gas for sending
    //       if (chainInfo.networkType.startsWith("evm")) {
    //         return {
    //           chainId: chainInfo.chainId,
    //           msgOpts: {
    //             send: {
    //               native: {
    //                 gas: 21000,
    //               },
    //               erc20: {
    //                 gas: 21000,
    //               },
    //             },
    //           },
    //         };
    //       }
    //       if (chainInfo.chainId.startsWith("osmosis")) {
    //         return {
    //           chainId: chainInfo.chainId,
    //           msgOpts: {
    //             withdrawRewards: {
    //               gas: 400000,
    //             },
    //             send: {
    //               native: {
    //                 gas: 400000,
    //               },
    //             },
    //           },
    //         };
    //       }

    //       return { chainId: chainInfo.chainId };
    //     }),
    //   }
    // );

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

    this.tokensStore = new TokensStore(
      {
        addEventListener: (type: string, fn: () => void) => {
          eventEmitter.addListener(type, fn);
        },
      },
      this.chainStore,
      new RNMessageRequesterInternal(),
      this.interactionStore
    );

    // this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar<ChainInfoWithEmbed>(
    //   new AsyncKVStore("store_test_ibc_currency_registrar"),
    //   24 * 3600 * 1000,
    //   this.chainStore,
    //   this.accountStore,
    //   this.queriesStore,
    //   this.queriesStore
    // );

    this.queriesStore = new QueriesStore(
      new AsyncKVStore("store_queries"),
      this.chainStore,
      {
        responseDebounceMs: 75,
      },
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      SecretQueries.use({
        apiGetter: getOWalletFromWindow,
      }),
      OsmosisQueries.use()
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
    this.deepLinkUriStore = new DeepLinkStore();
    this.browserStore = browserStore;
    this.modalStore = new ModalStore();
    this.appInitStore = appInit;
    this.universalSwapStore = universalSwapStore;
    this.hugeQueriesStore = new HugeQueriesStore(
      this.chainStore,
      this.queriesStore,
      this.accountStore,
      this.priceStore
    );
    // this.hugeQueriesNewStore = new HugeQueriesNewStore(
    //   this.chainStore,
    //   this.queriesStore,
    //   this.accountStore,
    //   this.priceStore
    // );
    this.notificationStore = notification;
    this.sendStore = new SendStore();
    this.txsStore = (currentChain: ChainInfoInner<ChainInfo>): TxsStore =>
      new TxsStore(currentChain);
  }
}

export function createRootStore() {
  return new RootStore();
}
