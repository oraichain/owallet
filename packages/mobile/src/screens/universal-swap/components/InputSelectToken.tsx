import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { IInputSelectToken } from "../types";
import OWIcon from "@src/components/ow-icon/ow-icon";
import { Text } from "@src/components/text";
import { BalanceText } from "./BalanceText";
import { TypeTheme, useTheme } from "@src/themes/theme-provider";
import { find } from "lodash";
import _debounce from "lodash/debounce";
import { tokensIcon } from "@oraichain/oraidex-common";

const InputSelectToken: FunctionComponent<IInputSelectToken> = ({
  tokenActive,
  amount,
  currencyValue,
  onChangeAmount,
  onOpenTokenModal,
  editable,
}) => {
  const { colors } = useTheme();
  const styles = styling(colors);
  const [txt, setText] = useState("0");
  const [tokenIcon, setTokenIcon] = useState(null);

  useEffect(() => {
    setText(Number(Number(amount).toFixed(6)).toString());
  }, [amount]);

  const handleChangeAmount = (amount) => {
    onChangeAmount(Number(Number(amount).toFixed(6)).toString());
  };

  const debounceFn = useCallback(_debounce(handleChangeAmount, 1000), []);

  useEffect(() => {
    const tokenIcon = find(
      tokensIcon,
      (tk) => tk.coinGeckoId === tokenActive.coinGeckoId
    );
    setTokenIcon(tokenIcon);
  }, [tokenActive]);

  return (
    <View style={[styles.containerInputSelectToken]}>
      <TouchableOpacity
        onPress={onOpenTokenModal}
        style={styles.btnChainContainer}
      >
        <View
          style={{
            width: 33,
            height: 33,
            borderRadius: 999,
            backgroundColor: colors["neutral-icon-on-dark"],
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <OWIcon type="images" source={{ uri: tokenIcon?.Icon }} size={30} />
        </View>

        <View style={[styles.ml8, styles.itemTopBtn]}>
          <View style={styles.pr4}>
            <Text weight="600" size={16} color={colors["neutral-text-action"]}>
              {tokenActive?.name}
            </Text>
            {/* <BalanceText size={12} weight="500" style={styles.mt_4}>
              {tokenActive?.org}
            </BalanceText> */}
          </View>
          <OWIcon
            color={colors["neutral-icon-on-light"]}
            name="down"
            size={16}
          />
        </View>
      </TouchableOpacity>

      <View style={styles.containerInput}>
        <TextInput
          editable={editable}
          placeholder="0"
          textAlign="right"
          value={txt}
          onFocus={() => {
            if (!txt || Number(txt) === 0) {
              setText("");
            }
          }}
          onChangeText={(t) => {
            const newAmount = t.replace(/,/g, ".");
            setText(newAmount.toString());
            debounceFn(newAmount);
          }}
          defaultValue={amount ?? "0"}
          onBlur={() => {
            handleChangeAmount(txt);
          }}
          keyboardType="numeric"
          style={[styles.textInput, styles.colorInput]}
          placeholderTextColor={colors["text-place-holder"]}
        />
        <View style={{ alignSelf: "flex-end" }}>
          <BalanceText weight="500">≈ ${currencyValue || 0}</BalanceText>
        </View>
      </View>
    </View>
  );
};

export default InputSelectToken;

const styling = (colors: TypeTheme["colors"]) =>
  StyleSheet.create({
    mt_4: {
      marginTop: -4,
    },
    colorInput: {
      color: colors["neutral-text-title"],
      fontWeight: "500",
    },
    pr4: {
      paddingRight: 4,
    },
    labelSymbol: {
      paddingRight: 5,
    },
    itemTopBtn: {
      flexDirection: "row",
      alignItems: "center",
    },
    mtde5: {
      marginTop: -5,
    },
    textInput: {
      width: "100%",
      fontSize: 22,
      paddingVertical: 0,
    },
    containerInput: {
      flex: 1,
      alignItems: "flex-end",
    },
    ml8: {
      paddingLeft: 8,
    },
    btnChainContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 999,
      backgroundColor: colors["neutral-surface-action"],
      paddingHorizontal: 12,
      height: 54,
      borderWidth: 1,
      borderColor: colors["neutral-surface-pressed"],
    },
    containerInputSelectToken: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 8,
    },
  });
