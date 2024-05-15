import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@src/themes/theme-provider";
import OWButtonIcon from "@src/components/button/ow-button-icon";
import OWText from "@src/components/text/ow-text";
import { metrics } from "@src/themes";
import NumericPad from "react-native-numeric-pad";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import { TextInput } from "@src/components/input";
import { OWButton } from "@src/components/button";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { showToast } from "@src/utils/helper";
import { useStore } from "@src/stores";
import { Controller, useForm } from "react-hook-form";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const Pincode: FunctionComponent<{
  onVerifyPincode: Function;
  needConfirmation: boolean;
  isModal?: boolean;
  onGoBack?: Function;
  label?: string;
  subLabel?: string;
}> = ({
  onVerifyPincode,
  needConfirmation,
  onGoBack,
  label,
  subLabel,
  isModal,
}) => {
  const { appInitStore } = useStore();

  const { colors } = useTheme();

  const [statusPass, setStatusPass] = useState(false);
  const [isNumericPad, setNumericPad] = useState(true);
  const [confirmCode, setConfirmCode] = useState(null);
  const [prevPad, setPrevPad] = useState(null);
  const [counter, setCounter] = useState(0);

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const [isCreating, setIsCreating] = useState(false);

  const {
    control,
    formState: { errors },
  } = useForm<FormData>();

  const showPass = () => setStatusPass(!statusPass);

  const pinRef = useRef(null);
  const numpadRef = useRef(null);

  const [code, setCode] = useState("");

  const handleSetPassword = () => {
    setConfirmCode(code);
    setCode("");
    numpadRef?.current?.clearAll();
    setPrevPad("numeric");
    appInitStore.updateKeyboardType("numeric");
  };

  const handleContinue = () => {
    setPrevPad("numeric");
    appInitStore.updateKeyboardType("numeric");
    if (password.length >= 6) {
      if (!confirmCode) {
        setConfirmCode(password);
        setPassword("");
      } else {
        handleCheckConfirm(password);
      }
    } else {
      showToast({
        message: "*The password must be at least 6 characters",
        type: "danger",
      });
    }
  };

  const onSwitchPad = (type) => {
    setCode("");
    if (type === "numeric") {
      setNumericPad(true);
    } else {
      setNumericPad(false);
    }
  };

  const onHandleConfirmPincodeError = () => {
    showToast({
      message: `${counter} times false. Please try again`,
      type: "danger",
    });
    setConfirmCode(null);
    pinRef?.current?.shake().then(() => setCode(""));
    numpadRef?.current?.clearAll();
    setCounter(0);
    setPassword("");
  };

  const onHandleResetPincode = () => {
    showToast({
      message: `Password doesn't match`,
      type: "danger",
    });
    pinRef?.current?.shake().then(() => setCode(""));
    setPassword("");
    numpadRef?.current?.clearAll();
  };

  const handleCheckConfirm = (confirmPass) => {
    if (confirmCode === confirmPass && counter < 3) {
      onVerifyPincode(code);
    } else {
      setCounter(counter + 1);
      if (counter > 3) {
        onHandleConfirmPincodeError();
      } else {
        onHandleResetPincode();
      }
    }
  };

  const handleConfirm = () => {
    if (prevPad === "numeric") {
      handleCheckConfirm(code);
    } else {
      handleCheckConfirm(password);
    }
  };

  useEffect(() => {
    if (needConfirmation) {
      if (code.length >= 6) {
        if (confirmCode) {
          handleConfirm();
        } else {
          handleSetPassword();
        }
      }
    } else {
      if (code.length >= 6) {
        numpadRef?.current?.clearAll();
        onVerifyPincode(code);
      }
    }
  }, [code]);

  const renderPassword = ({ field: {} }) => {
    return (
      <TextInput
        accessibilityLabel="password"
        returnKeyType="done"
        secureTextEntry={statusPass}
        value={password}
        error={isFailed ? "Invalid password" : undefined}
        onChangeText={(txt) => {
          setPassword(txt);
        }}
        inputContainerStyle={{
          width: metrics.screenWidth - 40,
          borderWidth: 2,
          borderColor: colors["primary-surface-default"],
          borderRadius: 8,
          minHeight: 56,
          alignItems: "center",
          justifyContent: "center",
        }}
        placeholder="Enter your passcode"
        inputRight={
          <OWButtonIcon
            style={styles.padIcon}
            onPress={showPass}
            name={statusPass ? "eye" : "eye-slash"}
            colorIcon={colors["neutral-text-title"]}
            sizeIcon={22}
          />
        }
      />
    );
  };
  const validatePassword = (value: string) => {
    if (value.length < 6) {
      return "Password must be longer than 6 characters";
    }
  };

  const styles = useStyles();

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      {isCreating ? (
        <View
          style={{
            backgroundColor: colors["neutral-surface-bg"],
            width: metrics.screenWidth,
            height: metrics.screenHeight,
            opacity: 0.8,
            position: "absolute",
            zIndex: 999,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} />
        </View>
      ) : null}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.goBack}
          onPress={() => onGoBack && onGoBack()}
        >
          <OWIcon
            size={16}
            color={colors["neutral-icon-on-light"]}
            name="arrow-left"
          />
        </TouchableOpacity>
        <View style={styles.aic}>
          {label ? (
            <OWText
              color={colors["neutral-text-title"]}
              variant="h2"
              typo="bold"
            >
              {label}
            </OWText>
          ) : (
            <OWText
              color={colors["neutral-text-title"]}
              variant="h2"
              typo="bold"
            >
              {confirmCode ? "Confirm your" : "Set"} passcode
            </OWText>
          )}

          {subLabel ? (
            <OWText color={colors["neutral-text-body"]} weight={"500"}>
              {subLabel}
            </OWText>
          ) : (
            <OWText color={colors["neutral-text-body"]} weight={"500"}>
              Secure your wallet by setting a passcode
            </OWText>
          )}
          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 32,
            }}
          >
            {isNumericPad ? (
              <SmoothPinCodeInput
                ref={pinRef}
                keyboardType={"email-address"}
                value={code}
                codeLength={6}
                cellStyle={{
                  borderWidth: 0,
                }}
                cellStyleFocused={{
                  borderColor: colors["neutral-surface-action"],
                }}
                placeholder={
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 48,
                      backgroundColor: colors["neutral-surface-action"],
                    }}
                  />
                }
                mask={
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 48,
                      opacity: 0.7,
                      backgroundColor: colors["highlight-surface-active"],
                    }}
                  />
                }
                maskDelay={1000}
                password={true}
                //   onFulfill={}
                onBackspace={(code) => console.log(code)}
              />
            ) : (
              <View
                style={{
                  width: metrics.screenWidth,
                  paddingHorizontal: 20,
                }}
              >
                <Controller
                  control={control}
                  rules={{
                    required: "Password is required",
                    validate: validatePassword,
                  }}
                  render={renderPassword}
                  name="password"
                  defaultValue=""
                />
                <OWText
                  size={13}
                  color={colors["neutral-text-body"]}
                  weight={"400"}
                >
                  *The password must be at least 6 characters
                </OWText>
              </View>
            )}
          </View>

          <View style={[styles.rc, styles.switch]}>
            <TouchableOpacity
              style={[
                styles.switchText,
                isNumericPad ? styles.switchTextActive : { marginRight: 9 },
              ]}
              onPress={() => onSwitchPad("numeric")}
            >
              <OWText
                color={colors["neutral-text-action-on-light-bg"]}
                weight="500"
                size={16}
              >
                123
              </OWText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchText,
                !isNumericPad ? styles.switchTextActive : { marginLeft: 9 },
              ]}
              onPress={() => onSwitchPad("alphabet")}
            >
              <OWText weight="500" size={16}>
                Aa
              </OWText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.aic}>
          {isNumericPad ? (
            <NumericPad
              ref={numpadRef}
              numLength={6}
              buttonSize={40}
              activeOpacity={0.1}
              onValueChange={(value) => {
                console.log("setCode", value);

                setCode(value);
              }}
              allowDecimal={false}
              // style={{ backgroundColor: 'black', paddingVertical: 12 }}
              // buttonAreaStyle={{ backgroundColor: 'gray' }}
              buttonItemStyle={styles.buttonItemStyle}
              buttonTextStyle={styles.buttonTextStyle}
              //@ts-ignore
              rightBottomButton={
                <OWIcon
                  size={30}
                  color={colors["neutral-text-title"]}
                  name="backspace-outline"
                />
              }
              onRightBottomButtonPress={() => {
                numpadRef.current.clear();
              }}
            />
          ) : (
            <View style={styles.signIn}>
              <OWButton
                style={{
                  borderRadius: 32,
                }}
                label="Continue"
                disabled={isLoading || !password}
                onPress={() => {
                  handleContinue();
                }}
                loading={isLoading || isBiometricLoading}
              />
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const useStyles = () => {
  const { colors } = useTheme();
  // const safeAreaInsets = useSafeAreaInsets();

  return StyleSheet.create({
    padIcon: {
      paddingLeft: 10,
      width: "auto",
    },
    icon: {
      width: 22,
      height: 22,
      tintColor: colors["icon-primary-surface-default-gray"],
    },

    title: {
      fontSize: 24,
      lineHeight: 34,
      fontWeight: "700",
      color: colors["text-title"],
    },
    headerContainer: {
      height: 72,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    container: {
      // paddingTop: safeAreaInsets.top,
      justifyContent: "space-between",
      height: "95%",
      backgroundColor: colors["neutral-surface-card"],
    },
    signIn: {
      width: "100%",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors["neutral-border-default"],
      padding: 16,
    },
    aic: {
      alignItems: "center",
      paddingBottom: 20,
    },
    rc: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonTextStyle: {
      fontSize: 22,
      color: colors["neutral-text-title"],
      fontFamily: "SpaceGrotesk-SemiBold",
    },
    buttonItemStyle: {
      backgroundColor: colors["neutral-surface-action3"],
      width: 110,
      height: 80,
      borderRadius: 8,
    },
    switch: {
      backgroundColor: colors["neutral-surface-action3"],
      padding: 4,
      borderRadius: 999,
      marginTop: 32,
    },
    switchText: {
      paddingHorizontal: 24,
      paddingVertical: 6,
    },
    switchTextActive: {
      backgroundColor: colors["neutral-surface-toggle-active"],
      borderRadius: 999,
    },
    goBack: {
      backgroundColor: colors["neutral-surface-action3"],
      borderRadius: 999,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
  });
};
