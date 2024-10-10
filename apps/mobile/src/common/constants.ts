import images from "@src/assets/images";
import { Platform } from "react-native";
import { isMilliseconds } from "@owallet/common";

const fetchWrap = require("fetch-retry")(global.fetch);

export const fetchRetry = async (url, config?: any) => {
  const response = await fetchWrap(url, {
    retries: 3,
    retryDelay: 1000,
    ...config,
  });
  if (response.status !== 200) return;
  const jsonRes = await response.json();
  return jsonRes;
};
export const HEADER_KEY = {
  notShowHeader: "NOT_SHOW_HEADER",
  showNetworkHeader: "SHOW_NETWORK_HEADER",
};
export const isAndroid = Platform.OS === "android";
export const isIos = Platform.OS === "ios";
export const defaultAll = { label: "All", value: "All", image: images.crypto };
export const CONTRACT_WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const AFFILIATE_ADDRESS = "orai1h8rg7zknhxmffp3ut5ztsn8zcaytckfemdkp8n";

export const SCREENS = {
  Home: "Home",
  TransactionDetail: "Transactions.Detail",
  BackupMnemonic: "BackupMnemonic",
  RecoveryPhrase: "RecoveryPhrase",
  RegisterMain: "RegisterMain",
  BuyFiat: "BuyFiat",
  RegisterVerifyMnemonicMain: "RegisterVerifyMnemonicMain",
  RegisterEnd: "Register.End",
  RegisterDone: "Register.Done",
  RegisterRecoverMnemonicMain: "RegisterRecoverMnemonicMain",
  RegisterRecoverPhraseMain: "RegisterRecoverPhraseMain",
  RegisterNewLedgerMain: "RegisterNewLedgerMain",
  Tokens: "Tokens",
  Nfts: "Nfts",
  NftsDetail: "Nfts.Detail",
  HistoryDetail: "History.Detail",
  TokenDetails: "Token.Details",
  UniversalSwapScreen: "UniversalSwapScreen",
  RegisterIntro: "Register.Intro",
  RegisterNewUser: "Register.NewUser",
  RegisterNotNewUser: "Register.NotNewUser",
  RegisterNewMnemonic: "Register.NewMnemonic",
  RegisterNewPincode: "Register.NewPincode",
  RegisterVerifyMnemonic: "Register.VerifyMnemonic",
  RegisterRecoverMnemonic: "Register.RecoverMnemonic",
  RegisterRecoverPhrase: "Register.RecoverPhrase",
  RegisterNewLedger: "Register.NewLedger",
  PincodeScreen: "PincodeScreen",
  Send: "Send",
  SendEvm: "SendEvm",
  SendOasis: "SendOasis",
  TransferNFT: "TransferNFT",
  Transactions: "Transactions",
  Dashboard: "Dashboard",
  Camera: "Camera",
  QRScreen: "QRScreen",
  Governance: "Governance",
  GovernanceDetails: "Governance.Details",
  NetworkSelect: "Network.select",
  NetworkToken: "Network.token",
  ValidatorDetails: "Validator.Details",
  ValidatorList: "Validator.List",
  TxPendingResult: "TxPendingResult",
  TxSuccessResult: "TxSuccessResult",
  TxFailedResult: "TxFailedResult",
  Setting: "Setting",
  SettingSelectAccount: "SettingSelectAccount",
  SettingViewPrivateData: "Setting.ViewPrivateData",
  ManageWalletConnect: "Setting.ManageWalletConnect",
  SettingBackupMnemonic: "Setting.BackupMnemonic",
  SettingVersion: "Setting.Version",
  DetailsBrowser: "Detail.Browser",
  AddressBook: "AddressBook",
  ManageChain: "ManageChain",
  AddChain: "AddChain",
  AddAddressBook: "AddAddressBook",
  Browser: "Browser",
  BookMarks: "BookMarks",
  WebIntro: "Web.Intro",
  WebDApp: "Web.dApp",
  Invest: "Invest",
  Delegate: "Delegate",
  NewSend: "NewSend",
  SendTron: "SendTron",
  SendBtc: "SendBtc",
  Notifications: "Notifications",
  DelegateDetail: "Delegate.Detail",
  Redelegate: "Redelegate",
  Undelegate: "Undelegate",
  TABS: {
    Main: "Main",
    Home: "Home",
    Browser: "Browser",
    Invest: "Invest_Tab",
    Settings: "Settings",
    SendNavigation: "SendNavigation",
  },
  STACK: {
    Pincode: "Pincode",
    PincodeUnlock: "PincodeUnlock",
    Unlock: "Unlock",
    RecoverPhraseScreen: "RecoverPhraseScreen",
    MainTab: "MainTab",
    Register: "Register",
    Others: "Others",
    AddressBooks: "AddressBooks",
  },
};
export const ICONS_TITLE = {
  [SCREENS.TABS.Invest]: "tdesigntrending-up",
  [SCREENS.TABS.Main]: "tdesignchart-pie",
  [SCREENS.TABS.Browser]: "tdesigninternet",
  [SCREENS.TABS.Settings]: "tdesignsetting-1",
  [SCREENS.TABS.SendNavigation]: "",
};

//@ts-ignore
export const SCREENS_OPTIONS: IScreenOption = {
  [SCREENS.TABS.Invest]: {
    title: "Stake",
  },
  [SCREENS.TABS.Main]: {
    title: "Assets",
  },
  [SCREENS.TABS.Browser]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.TABS.Settings]: {
    title: "Settings",
  },
  [SCREENS.TABS.SendNavigation]: {
    title: "",
  },
  [SCREENS.Home]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.Invest]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.TransactionDetail]: {
    title: "Transaction Details",
  },
  [SCREENS.BackupMnemonic]: {
    showTabBar: false,
  },
  [SCREENS.RegisterMain]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterVerifyMnemonicMain]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterEnd]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterDone]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.DetailsBrowser]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterRecoverMnemonicMain]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterNewLedgerMain]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.ManageWalletConnect]: {
    title: "Manage Wallet Connect",
  },
  [SCREENS.Tokens]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.TokenDetails]: {
    title: "Token",
  },
  [SCREENS.Nfts]: {
    title: "My nfts",
  },
  [SCREENS.NftsDetail]: {
    title: "NFT",
  },
  [SCREENS.UniversalSwapScreen]: {
    // title: HEADER_KEY.notShowHeader,
    title: "Universal Swap",
  },
  [SCREENS.RegisterIntro]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterNewUser]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterNotNewUser]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterNewMnemonic]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterNewPincode]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterVerifyMnemonic]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterRecoverMnemonic]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RecoveryPhrase]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.RegisterNewLedger]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.Send]: {
    title: "Send ",
  },
  [SCREENS.TransferNFT]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.Transactions]: {
    title: "Transaction History",
  },
  [SCREENS.Camera]: {
    title: "Scan QR Code",
  },
  [SCREENS.QRScreen]: {
    title: "Receive",
  },
  [SCREENS.NewSend]: {
    title: "Send",
  },
  [SCREENS.SendTron]: {
    title: "Send",
  },
  [SCREENS.PincodeScreen]: {
    title: HEADER_KEY.notShowHeader,
  },
  [SCREENS.SendOasis]: {
    title: "Send",
  },
  [SCREENS.Notifications]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.NetworkSelect]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.NetworkToken]: {
    // title: HEADER_KEY.showNetworkHeader,
    title: "Add Token",
  },
  [SCREENS.ValidatorDetails]: {
    title: "Validator details",
  },
  [SCREENS.ValidatorList]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.TxPendingResult]: {
    title: "Transaction details",
  },
  [SCREENS.TxSuccessResult]: {
    title: "Transaction details",
  },
  [SCREENS.TxFailedResult]: {
    title: "Transaction details",
  },
  [SCREENS.Setting]: {
    title: "Settings",
  },
  [SCREENS.SettingSelectAccount]: {
    title: "Manage wallet",
  },
  [SCREENS.AddChain]: {
    title: "Add Chain",
  },
  [SCREENS.SettingViewPrivateData]: {
    title: "Mnemonic Seed",
  },
  [SCREENS.HistoryDetail]: {
    title: "Transaction details",
  },
  [SCREENS.BuyFiat]: {
    title: "Buy",
  },
  [SCREENS.SettingVersion]: {
    title: "About",
  },
  [SCREENS.SendBtc]: {
    title: "Send",
  },
  [SCREENS.SendEvm]: {
    title: "Send",
  },
  [SCREENS.AddressBook]: {
    title: "Address book",
  },
  [SCREENS.ManageChain]: {
    title: "Select Chains",
  },

  [SCREENS.AddAddressBook]: {
    title: "Add new contact",
  },
  [SCREENS.Browser]: {
    title: "Browser",
  },
  [SCREENS.BookMarks]: {
    title: "Bookmarks",
  },
  [SCREENS.WebIntro]: {
    title: "",
  },
  [SCREENS.WebDApp]: {
    title: "",
  },
  [SCREENS.Delegate]: {
    title: "Stake",
  },
  [SCREENS.DelegateDetail]: {
    title: HEADER_KEY.showNetworkHeader,
  },
  [SCREENS.Redelegate]: {
    title: "Redelegate",
  },
  [SCREENS.Undelegate]: {
    title: "Unstake",
  },
  [SCREENS.STACK.Unlock]: {
    title: "",
  },
  [SCREENS.STACK.RecoverPhraseScreen]: {
    title: "",
  },
  [SCREENS.STACK.PincodeUnlock]: {
    title: "",
  },
  [SCREENS.STACK.Pincode]: {
    title: "",
  },
  [SCREENS.STACK.Pincode]: {
    title: "",
  },
  [SCREENS.STACK.MainTab]: {
    title: "",
  },
  [SCREENS.STACK.Register]: {
    title: "",
  },
  [SCREENS.STACK.Others]: {
    title: "",
  },
  [SCREENS.STACK.AddressBooks]: {
    title: "",
  },
};
export const TYPE_ACTIONS_COSMOS_HISTORY = {
  ["delegate"]: "delegate",
  ["send"]: "send",
  ["receive"]: "receive",
  ["withdraw_delegator_reward"]: "withdraw_delegator_reward",
  ["begin_redelegate"]: "begin_redelegate",
  ["begin_unbonding"]: "begin_unbonding",
  ["transfer"]: "transfer",
  ["execute"]: "execute",
  ["wasm/MsgExecuteContract"]: "/cosmwasm.wasm.v1.MsgExecuteContract",
  ["bank/MsgSend"]: "/cosmos.bank.v1beta1.MsgSend",
  ["distribution/MsgWithdrawDelegatorReward"]:
    "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  ["staking/MsgDelegate"]: "/cosmos.staking.v1beta1.MsgDelegate",
  ["staking/MsgUndelegate"]: "/cosmos.staking.v1beta1.MsgUndelegate",
  ["submit_proposal"]: "submit_proposal",
  ["gov/MsgSubmitProposal"]: "/cosmos.gov.v1beta1.MsgSubmitProposal",
};
export const TITLE_TYPE_ACTIONS_COSMOS_HISTORY = {
  [TYPE_ACTIONS_COSMOS_HISTORY.receive]: "Receive",
};
export const EVENTS = {
  hiddenTabBar: "hiddenTabBar",
};
// export const urlTxHistory = "https://tx-history-backend.oraidex.io/";
export const urlAiRight = "https://developers.airight.io";
// export const urlTxHistory = "http://10.10.20.113:8000/";
// export const urlTxHistory = "https://tx-history-backend-staging.oraidex.io/";
export const listSkeleton = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const getTimeMilliSeconds = (timeStamp) => {
  if (isMilliseconds(timeStamp)) {
    return timeStamp;
  }
  return timeStamp * 1000;
};
