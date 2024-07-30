import React, { FunctionComponent, useCallback, useState } from "react";
import { RNCamera } from "react-native-camera";
import { PageWithView } from "../../components/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSmartNavigation } from "../../navigation.provider";
import { Button, OWButton } from "../../components/button";
import { Share, StyleSheet, View } from "react-native";
import { ChainSelectorModal } from "../../components/chain-selector";
import { registerModal } from "../../modals/base";
import { CardModal } from "../../modals/card";
import { AddressCopyable } from "../../components/address-copyable";
import QRCode from "react-native-qrcode-svg";
import { useNavigation } from "@react-navigation/native";
import { Bech32Address } from "@owallet/cosmos";
import { FullScreenCameraView } from "../../components/camera";
import { useFocusEffect } from "@react-navigation/native";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { TRON_ID } from "@owallet/common";
import { checkValidDomain } from "@src/utils/helper";
import { navigate } from "@src/router/root";
import { SCREENS } from "@src/common/constants";
import { useTheme } from "@src/themes/theme-provider";
import { metrics } from "@src/themes";
import { tracking } from "@src/utils/tracking";
interface keyable {
  [key: string]: any;
}

export const CameraScreen: FunctionComponent = observer((props) => {
  const { chainStore, keyRingStore } = useStore();
  const { colors } = useTheme();

  const navigation = useNavigation();
  const smartNavigation = useSmartNavigation();

  const [isLoading, setIsLoading] = useState(false);
  // To prevent the reading while changing to other screen after processing the result.
  // Expectedly, screen should be moved to other after processing the result.
  const [isCompleted, setIsCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      tracking(`QRCode Modal`);
      // If the other screen is pushed according to the qr code data,
      // the `isCompleted` state would remain as true because the screen in the stack is not unmounted.
      // So, we should reset the `isComplete` state whenever getting focused.
      setIsCompleted(false);
    }, [])
  );

  const [isSelectChainModalOpen, setIsSelectChainModalOpen] = useState(false);
  const [isAddressQRCodeModalOpen, setIsAddressQRCodeModalOpen] =
    useState(false);
  const [showingAddressQRCodeChainId, setShowingAddressQRCodeChainId] =
    useState(chainStore.current.chainId);

  // const registerConfig = useRegisterConfig(keyRingStore, []);

  // const [addressBookConfigMap] = useState(
  //   () => new AddressBookConfigMap(new AsyncKVStore('address_book'), chainStore)
  // );

  return (
    <PageWithView disableSafeArea={true}>
      <FullScreenCameraView
        type={RNCamera.Constants.Type.back}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        captureAudio={false}
        isLoading={isLoading}
        onBarCodeRead={async ({ data }) => {
          if (!isLoading && !isCompleted) {
            setIsLoading(true);

            if (chainStore.current.chainId === TRON_ID && data) {
              smartNavigation.pushSmart("SendTron", {
                recipient: data,
              });
            }

            try {
              if (checkValidDomain(data.toLowerCase())) {
                navigation.navigate("Browser", { url: data.toLowerCase() });

                return;
              }

              const isBech32Address = (() => {
                try {
                  // Check that the data is bech32 address.
                  // If this is not valid bech32 address, it will throw an error.
                  Bech32Address.validate(data);
                } catch {
                  return false;
                }
                return true;
              })();

              if (isBech32Address) {
                const prefix = data.slice(0, data.indexOf("1"));
                const chainInfo = chainStore.chainInfosInUI.find(
                  (chainInfo) =>
                    chainInfo.bech32Config.bech32PrefixAccAddr === prefix
                );
                if (chainInfo) {
                  const routersParam: keyable =
                    smartNavigation?.getState()?.routes;
                  const isParamAddressBook = routersParam.find(
                    (route) => route?.params?.screenCurrent === "addressbook"
                  );
                  if (isParamAddressBook) {
                    smartNavigation.navigateSmart("AddAddressBook", {
                      chainId: chainInfo.chainId,
                      recipient: data,
                      addressBookObj: {
                        name: isParamAddressBook.params.name,
                      },
                    });
                  } else if (chainStore.current.networkType === "bitcoin") {
                    navigate(SCREENS.STACK.Others, {
                      screen: SCREENS.SendBtc,
                      params: {
                        chainId: chainInfo.chainId,
                        recipient: data,
                      },
                    });
                  } else {
                    smartNavigation.pushSmart("NewSend", {
                      chainId: chainInfo.chainId,
                      recipient: data,
                    });
                  }
                } else {
                  smartNavigation.navigateSmart("Home", {});
                }
              }

              setIsCompleted(true);
            } catch (e) {
              console.log(e);
            } finally {
              setIsLoading(false);
            }
          }
        }}
        containerBottom={
          <View
            style={{
              position: "absolute",
              bottom: 0,
              backgroundColor: "#19191A",
              width: metrics.screenWidth,
            }}
          >
            <View
              style={{
                paddingBottom: 20,
                width: metrics.screenWidth,
                alignItems: "center",
              }}
            >
              <OWButton
                label="My QR Code"
                onPress={() => {
                  navigate(SCREENS.STACK.Others, {
                    screen: SCREENS.QRScreen,
                  });
                }}
                style={[
                  {
                    width: metrics.screenWidth - 32,
                    marginTop: 20,
                    borderRadius: 999,
                    backgroundColor: "#323133", //colors["neutral-surface-action3"]
                  },
                ]}
                textStyle={{
                  fontSize: 14,
                  fontWeight: "600",
                }}
              />
            </View>
          </View>
        }
      />
      <ChainSelectorModal
        isOpen={isSelectChainModalOpen}
        close={() => setIsSelectChainModalOpen(false)}
        chainIds={chainStore.chainInfosInUI.map(
          (chainInfo) => chainInfo.chainId
        )}
        onSelectChain={(chainId) => {
          setShowingAddressQRCodeChainId(chainId);
          setIsAddressQRCodeModalOpen(true);
          setIsSelectChainModalOpen(false);
        }}
      />
      <AddressQRCodeModal
        isOpen={isAddressQRCodeModalOpen}
        close={() => setIsAddressQRCodeModalOpen(false)}
        chainId={showingAddressQRCodeChainId}
      />
    </PageWithView>
  );
});

export const AddressQRCodeModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  chainId: string;
}> = registerModal(
  observer(({ chainId }) => {
    const { accountStore } = useStore();

    const account = accountStore.getAccount(chainId);

    return (
      <CardModal title="Scan QR code">
        <View
          style={{
            alignItems: "center",
          }}
        >
          <AddressCopyable address={account.bech32Address} maxCharacters={22} />
          <View
            style={{
              marginTop: 32,
              marginBottom: 32,
            }}
          >
            {account.bech32Address ? (
              <QRCode size={200} value={account.bech32Address} />
            ) : (
              <View
                style={StyleSheet.flatten([
                  {
                    width: 200,
                    height: 200,
                    backgroundColor: "#EEEEF3",
                  },
                ])}
              />
            )}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <OWButton
              // containerStyle={{
              //   flex: 1
              // }}
              label="Share Address"
              loading={account.bech32Address === ""}
              onPress={() => {
                Share.share({
                  message: account.bech32Address,
                }).catch((e) => {
                  console.log(e);
                });
              }}
            />
          </View>
        </View>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
