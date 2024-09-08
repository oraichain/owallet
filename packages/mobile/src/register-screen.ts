import { Navigation } from "react-native-navigation";
import { PincodeUnlockScreen } from "./screens/unlock/pincode-unlock";
import { SCREENS } from "./common/constants";
import { RecoverPhraseScreen } from "./screens/register/mnemonic/recover-phrase";
import { RegisterIntroScreen } from "./screens/register";
import { NewPincodeScreen } from "./screens/register/register-pincode";
import { ViewPrivateDataScreen } from "./screens/setting/screens/view-private-data";
import { OWalletVersionScreen } from "./screens/setting/screens/version";
import { DetailsBrowserScreen } from "./screens/web/details-browser-screen";
import { BookmarksScreen } from "./screens/web/bookmarks-screen";
import { WebScreen } from "./screens/web";
import {
  AddAddressBookScreen,
  AddressBookScreen,
} from "./screens/setting/screens/address-book";
import { MainTabNavigation } from "./navigations";
import { TokenDetailsScreen, TokensScreen } from "./screens/tokens";
import { BackupMnemonicScreen } from "./screens/register/mnemonic/backup-mnemonic";
import {
  NewMnemonicScreen,
  RecoverMnemonicScreen,
  VerifyMnemonicScreen,
} from "./screens/register/mnemonic";
import { RegisterEndScreen } from "./screens/register/end";
import { RegisterDoneScreen } from "./screens/register/done";
import { NewLedgerScreen } from "./screens/register/ledger";
import { NftDetailScreen, NftsScreen } from "./screens/nfts";
import {
  DelegateScreen,
  ValidatorDetailsScreen,
  ValidatorListScreen,
} from "./screens/stake";
import { DelegateDetailScreen } from "./screens/stake/delegate/delegate-detail";
import { RedelegateScreen } from "./screens/stake/redelegate";
import { UndelegateScreen } from "./screens/stake/undelegate";
import { SendScreen } from "./screens/send";
import { PincodeScreen } from "./screens/pincode/pincode";
import { NewSendScreen } from "./screens/send/send";
import { SendEvmScreen } from "./screens/send/send-evm";
import TxTransactionsScreen from "./screens/transactions/tx-transaction-screen";
import { HistoryDetail } from "./screens/transactions/history-detail";
import { CameraScreen } from "./screens/camera";
import { AddressQRScreen } from "./screens/qr";
import { SelectNetworkScreen } from "./screens/network";
import { AddTokenScreen } from "./screens/network/add-token";
import {
  TxFailedResultScreen,
  TxPendingResultScreen,
  TxSuccessResultScreen,
} from "./screens/tx-result";
import BuyFiat from "./screens/home/buy-fiat";
import { SendTronScreen } from "./screens/send/send-tron";
import { SendBtcScreen } from "./screens/send/send-btc";
import { SettingSelectAccountScreen } from "./screens/setting/screens/select-account";
import { withProviders } from "./app";
import { BrowserScreen } from "./screens/web/browser-screen";
import { HomeScreen } from "./screens/home";

Navigation.registerComponent(SCREENS.STACK.PincodeUnlock, () =>
  withProviders(PincodeUnlockScreen)
);

Navigation.registerComponent(SCREENS.RegisterRecoverPhrase, () =>
  withProviders(RecoverPhraseScreen)
);
Navigation.registerComponent(SCREENS.RegisterIntro, () =>
  withProviders(RegisterIntroScreen)
);
Navigation.registerComponent(SCREENS.RegisterNewPincode, () =>
  withProviders(NewPincodeScreen)
);
Navigation.registerComponent(SCREENS.SettingSelectAccount, () =>
  withProviders(SettingSelectAccountScreen)
);
Navigation.registerComponent(SCREENS.SettingViewPrivateData, () =>
  withProviders(ViewPrivateDataScreen)
);
Navigation.registerComponent(SCREENS.SettingVersion, () =>
  withProviders(OWalletVersionScreen)
);
Navigation.registerComponent(SCREENS.DetailsBrowser, () =>
  withProviders(DetailsBrowserScreen)
);
Navigation.registerComponent(SCREENS.BookMarks, () =>
  withProviders(BookmarksScreen)
);
Navigation.registerComponent(SCREENS.WebIntro, () => withProviders(WebScreen));
Navigation.registerComponent(SCREENS.AddressBook, () =>
  withProviders(AddressBookScreen)
);
Navigation.registerComponent(SCREENS.AddAddressBook, () =>
  withProviders(AddAddressBookScreen)
);
Navigation.registerComponent(SCREENS.STACK.MainTab, () =>
  withProviders(MainTabNavigation)
);
Navigation.registerComponent(SCREENS.TokenDetails, () =>
  withProviders(TokenDetailsScreen)
);
Navigation.registerComponent(SCREENS.BackupMnemonic, () =>
  withProviders(BackupMnemonicScreen)
);
Navigation.registerComponent(SCREENS.RegisterMain, () =>
  withProviders(NewMnemonicScreen)
);
Navigation.registerComponent(SCREENS.RegisterVerifyMnemonicMain, () =>
  withProviders(VerifyMnemonicScreen)
);
Navigation.registerComponent(SCREENS.RegisterEnd, () =>
  withProviders(RegisterEndScreen)
);
Navigation.registerComponent(SCREENS.RegisterDone, () =>
  withProviders(RegisterDoneScreen)
);
Navigation.registerComponent(SCREENS.RegisterRecoverMnemonicMain, () =>
  withProviders(RecoverMnemonicScreen)
);
Navigation.registerComponent(SCREENS.RegisterNewMnemonic, () =>
  withProviders(NewMnemonicScreen)
);
Navigation.registerComponent(SCREENS.RegisterRecoverPhraseMain, () =>
  withProviders(RecoverPhraseScreen)
);
Navigation.registerComponent(SCREENS.RegisterNewLedger, () =>
  withProviders(NewLedgerScreen)
);
Navigation.registerComponent(SCREENS.RegisterNewLedgerMain, () =>
  withProviders(NewLedgerScreen)
);
Navigation.registerComponent(SCREENS.Tokens, () => withProviders(TokensScreen));
Navigation.registerComponent(SCREENS.Nfts, () => withProviders(NftsScreen));
Navigation.registerComponent(SCREENS.NftsDetail, () =>
  withProviders(NftDetailScreen)
);
Navigation.registerComponent(SCREENS.ValidatorList, () =>
  withProviders(ValidatorListScreen)
);
Navigation.registerComponent(SCREENS.ValidatorDetails, () =>
  withProviders(ValidatorDetailsScreen)
);
Navigation.registerComponent(SCREENS.Delegate, () =>
  withProviders(DelegateScreen)
);
Navigation.registerComponent(SCREENS.DelegateDetail, () =>
  withProviders(DelegateDetailScreen)
);
Navigation.registerComponent(SCREENS.Redelegate, () =>
  withProviders(RedelegateScreen)
);
Navigation.registerComponent(SCREENS.Undelegate, () =>
  withProviders(UndelegateScreen)
);
Navigation.registerComponent(SCREENS.Send, () => withProviders(SendScreen));
Navigation.registerComponent(SCREENS.PincodeScreen, () =>
  withProviders(PincodeScreen)
);
Navigation.registerComponent(SCREENS.SettingBackupMnemonic, () =>
  withProviders(BackupMnemonicScreen)
);
Navigation.registerComponent(SCREENS.NewSend, () =>
  withProviders(NewSendScreen)
);
Navigation.registerComponent(SCREENS.SendEvm, () =>
  withProviders(SendEvmScreen)
);
Navigation.registerComponent(
  SCREENS.SendOasis,
  () => withProviders(SendEvmScreen) // Assuming SendEvmScreen is used for SendOasis
);
Navigation.registerComponent(SCREENS.Transactions, () =>
  withProviders(TxTransactionsScreen)
);
Navigation.registerComponent(SCREENS.HistoryDetail, () =>
  withProviders(HistoryDetail)
);
Navigation.registerComponent(SCREENS.Camera, () => withProviders(CameraScreen));
Navigation.registerComponent(SCREENS.QRScreen, () =>
  withProviders(AddressQRScreen)
);
Navigation.registerComponent(SCREENS.NetworkSelect, () =>
  withProviders(SelectNetworkScreen)
);
Navigation.registerComponent(SCREENS.NetworkToken, () =>
  withProviders(AddTokenScreen)
);
Navigation.registerComponent(SCREENS.TxPendingResult, () =>
  withProviders(TxPendingResultScreen)
);
Navigation.registerComponent(SCREENS.TxSuccessResult, () =>
  withProviders(TxSuccessResultScreen)
);
Navigation.registerComponent(SCREENS.BuyFiat, () => withProviders(BuyFiat));
Navigation.registerComponent(SCREENS.SendTron, () =>
  withProviders(SendTronScreen)
);
Navigation.registerComponent(SCREENS.SendBtc, () =>
  withProviders(SendBtcScreen)
);
Navigation.registerComponent(SCREENS.TxFailedResult, () =>
  withProviders(TxFailedResultScreen)
);
Navigation.registerComponent(SCREENS.Browser, () =>
  withProviders(BrowserScreen)
);
Navigation.registerComponent(SCREENS.Home, () => withProviders(HomeScreen));
