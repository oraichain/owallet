import { StyleSheet, Text, View } from "react-native";
import React from "react";
import OWButtonIcon from "../button/ow-button-icon";
import { useTheme } from "@src/themes/theme-provider";
import { observer } from "mobx-react-lite";
interface IOWHeaderRightProps {
  onAddWallet: () => void;
  onScan: () => void;
}
const OWHeaderRight = observer(
  ({ onAddWallet, onScan }: IOWHeaderRightProps) => {
    const { colors } = useTheme();
    return (
      <View style={styles.btnContainer}>
        <OWButtonIcon
          style={[
            styles.btnScan,
            {
              backgroundColor: colors["neutral-surface-card"],
            },
          ]}
          colorIcon={colors["neutral-text-title"]}
          sizeIcon={20}
          fullWidth={false}
          onPress={onScan}
          name="tdesignscan"
        />
        <OWButtonIcon
          style={[
            styles.btnHistory,
            {
              backgroundColor: colors["neutral-surface-card"],
            },
          ]}
          colorIcon={colors["neutral-text-title"]}
          sizeIcon={20}
          onPress={onAddWallet}
          name={"tdesigncreditcard-add"}
          fullWidth={false}
        />
      </View>
    );
  }
);

export default OWHeaderRight;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginRight: 16,
  },
  btnHistory: {
    height: 40,
    width: 40,
    borderRadius: 999,
  },
  btnScan: {
    height: 40,
    width: 40,
    borderRadius: 999,
  },
});
