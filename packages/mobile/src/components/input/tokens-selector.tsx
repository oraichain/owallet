import React, { FunctionComponent, useMemo, useRef, useState } from "react";
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { registerModal } from "../../modals/base";
import { RectButton } from "../rect-button";
import { metrics, spacing } from "../../themes";
import { useTheme } from "@src/themes/theme-provider";
import { BottomSheetProps } from "@gorhom/bottom-sheet";
import { chainIcons } from "@oraichain/oraidex-common";
import OWIcon from "../ow-icon/ow-icon";
import OWText from "../text/ow-text";
import { DownArrowIcon } from "../icon";
import { RadioButton } from "react-native-radio-buttons-group";
import { Bech32Address } from "@owallet/cosmos";
import { TextInput } from "./input";
import { DenomHelper, formatAddress } from "@owallet/common";
import { Text } from "@src/components/text";
import { ObservableQueryBalanceInner } from "@owallet/stores";
import { observer } from "mobx-react-lite";
import { useStore } from "@src/stores";
import {
  extractDataInParentheses,
  removeDataInParentheses,
} from "@src/utils/helper";
import { AppCurrency } from "@owallet/types";

export const TokenView: FunctionComponent<{
  balance: ObservableQueryBalanceInner;
  onClick: () => void;
  coinMinimalDenom: string;
}> = observer(({ coinMinimalDenom, onClick, balance }) => {
  const { priceStore, chainStore } = useStore();
  const { colors } = useTheme();

  const name = balance?.currency?.coinDenom;
  const getName = () => {
    return removeDataInParentheses(name);
  };
  const image = balance.currency?.coinImageUrl;
  let contractAddress: string = "";
  let amount = balance?.balance
    ?.trim(true)
    ?.shrink(true)
    ?.maxDecimals(6)
    ?.hideDenom(true);

  // If the currency is the IBC Currency.
  // Show the amount as slightly different with other currencies.
  // Show the actual coin denom to the top and just show the coin denom without channel info to the bottom.
  if ("originCurrency" in amount.currency && amount.currency.originCurrency) {
    amount = amount.setCurrency(amount.currency.originCurrency);
  } else {
    const denomHelper = new DenomHelper(amount.currency.coinMinimalDenom);
    if (denomHelper.contractAddress) {
      contractAddress = formatAddress(denomHelper.contractAddress, 8);
    }
  }
  if (extractDataInParentheses(name)) {
    contractAddress = extractDataInParentheses(name);
  }
  const tokenPrice = priceStore.calculatePrice(amount);
  return (
    <View
      style={{
        paddingVertical: 16,
        paddingHorizontal: 8,
        marginHorizontal: 8,
        borderRadius: 12,
        backgroundColor:
          coinMinimalDenom === balance.currency?.coinMinimalDenom
            ? colors["neutral-surface-action2"]
            : colors["neutral-surface-background2"],
      }}
    >
      <RectButton
        // key={}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        onPress={onClick}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              marginRight: 8,
              borderRadius: 999,
              width: 40,
              height: 40,
              backgroundColor: colors["neutral-icon-on-dark"],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {image && (
              <OWIcon type="images" source={{ uri: image }} size={28} />
            )}
          </View>
          <View>
            <OWText size={16} weight="500">
              {getName()}
            </OWText>
            {contractAddress ? (
              <OWText
                color={colors["neutral-text-body"]}
                size={14}
                weight="400"
              >
                {contractAddress}
              </OWText>
            ) : null}
          </View>
        </View>
        <View>
          <Text
            color={colors["neutral-text-title"]}
            size={16}
            weight={"500"}
            style={{
              textAlign: "right",
            }}
          >
            {amount?.toString()}
          </Text>
          <Text
            color={colors["neutral-text-body"]}
            size={14}
            weight={"400"}
            style={{
              textAlign: "right",
            }}
          >
            {tokenPrice?.toString()}
          </Text>
        </View>
      </RectButton>
    </View>
  );
});
export const TokenSelectorModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  bottomSheetModalConfig?: Omit<BottomSheetProps, "snapPoints" | "children">;
  items: ObservableQueryBalanceInner[];
  maxItemsToShow?: number;
  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;
  modalPersistent?: boolean;
}> = registerModal(
  ({
    close,
    items,
    selectedKey,
    setSelectedKey,
    maxItemsToShow,
    modalPersistent,
  }) => {
    const { colors } = useTheme();

    const [search, setSearch] = useState("");

    return (
      <View
        style={{
          borderRadius: spacing["8"],
          overflow: "hidden",
          backgroundColor: colors["neutral-surface-card"],
          paddingVertical: spacing["16"],
        }}
      >
        <View>
          <TextInput
            style={{
              paddingVertical: 0,
              height: 40,
              backgroundColor: colors["neutral-surface-action"],
              borderRadius: 999,
              paddingLeft: 35,
              fontSize: 16,
              color: colors["neutral-text-body"],
            }}
            inputContainerStyle={{
              borderWidth: 0,
            }}
            isBottomSheet={true}
            placeholderTextColor={colors["neutral-text-body"]}
            placeholder="Search for a token"
            onChangeText={(t) => setSearch(t)}
            defaultValue={search}
          />
          <View style={{ position: "absolute", left: 24, top: 24 }}>
            <OWIcon
              color={colors["neutral-icon-on-light"]}
              name="tdesign_search"
              size={16}
            />
          </View>
        </View>
        <ScrollView
          style={{
            maxHeight: maxItemsToShow ? maxItemsToShow * 70 : undefined,
          }}
          persistentScrollbar={true}
        >
          {items
            .filter(
              (token) =>
                token?.currency?.coinMinimalDenom?.includes(
                  search.toUpperCase()
                ) ||
                token?.currency?.coinDenom?.includes(search.toUpperCase()) ||
                token?.currency?.coinGeckoId?.includes(search.toUpperCase()) ||
                token?.currency?.coinMinimalDenom?.includes(
                  search.toLowerCase()
                ) ||
                token?.currency?.coinDenom?.includes(search.toLowerCase()) ||
                token?.currency?.coinGeckoId?.includes(search.toLowerCase())
            )
            .map((token, i) => {
              return (
                <TokenView
                  key={i.toString()}
                  balance={token}
                  coinMinimalDenom={selectedKey}
                  onClick={() => {
                    if (!token?.currency?.coinMinimalDenom) return;
                    setSelectedKey(token.currency.coinMinimalDenom);
                    close();
                  }}
                />
              );
            })}
        </ScrollView>
      </View>
    );
  }
);

export const TokensSelector: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
  label: string;
  chainId: string;
  placeHolder?: string;
  maxItemsToShow?: number;
  currencyActive: AppCurrency;

  items: any[];

  selectedKey: string | undefined;
  setSelectedKey: (key: string | undefined) => void;

  modalPersistent?: boolean;
}> = ({
  containerStyle,
  labelStyle,
  selectorContainerStyle,
  textStyle,
  label,
  maxItemsToShow,
  placeHolder,
  items,
  selectedKey,
  setSelectedKey,
  chainId,
  modalPersistent,
  currencyActive,
}) => {
  const selected = useMemo(() => {
    return items.find((item) => item.key === selectedKey);
  }, [items, selectedKey]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <React.Fragment>
      <TokenSelectorModal
        isOpen={isModalOpen}
        close={() => setIsModalOpen(false)}
        items={items}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        maxItemsToShow={maxItemsToShow}
        modalPersistent={modalPersistent}
        bottomSheetModalConfig={{}}
      />
      <SelectorButtonWithoutModal
        labelStyle={labelStyle}
        containerStyle={containerStyle}
        selectorContainerStyle={selectorContainerStyle}
        textStyle={textStyle}
        label={label}
        placeHolder={placeHolder}
        selected={selected}
        chainId={chainId}
        currencyActive={currencyActive}
        onPress={() => setIsModalOpen(true)}
      />
    </React.Fragment>
  );
};

export const SelectorButtonWithoutModal: FunctionComponent<{
  labelStyle?: TextStyle;
  containerStyle?: ViewStyle;
  selectorContainerStyle?: ViewStyle;
  textStyle?: TextStyle;
  chainId: string;
  label: string;
  placeHolder?: string;
  currencyActive: AppCurrency;
  selected:
    | {
        label: string;
        key: string;
      }
    | {
        contractAddress: string;
        denom: string;
        image: string;
        key: string;
      }
    | undefined;

  onPress: () => void;
}> = ({ selected, currencyActive, onPress, chainId }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors["neutral-surface-action3"],
          alignItems: "center",
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginTop: 12,
        }}
      >
        {currencyActive?.coinImageUrl && (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              backgroundColor: colors["neutral-icon-on-dark"],
            }}
          >
            <OWIcon
              size={20}
              type={"images"}
              source={{
                uri: currencyActive?.coinImageUrl,
              }}
            />
          </View>
        )}
        <OWText style={{ paddingHorizontal: 4 }} weight="600" size={14}>
          {removeDataInParentheses(currencyActive?.coinDenom)}
        </OWText>
        <DownArrowIcon height={11} color={colors["primary-text"]} />
      </View>
    </TouchableOpacity>
  );
};
