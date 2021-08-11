import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Card, CardBody } from "../../../../components/staging/card";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "../../../../styles";
import { Button } from "../../../../components/staging/button";
import { useSmartNavigation } from "../../../../navigation";

export const DelegatedCard: FunctionComponent<{
  containerStyle?: ViewStyle;

  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, queriesStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const smartNavigation = useSmartNavigation();

  const style = useStyle();

  const staked = queries.cosmos.queryDelegations
    .getQueryBech32Address(account.bech32Address)
    .getDelegationTo(validatorAddress);

  const rewards = queries.cosmos.queryRewards
    .getQueryBech32Address(account.bech32Address)
    .getStakableRewardOf(validatorAddress);

  return (
    <Card style={containerStyle}>
      <CardBody>
        <View
          style={style.flatten(["flex-row", "items-center", "margin-bottom-4"])}
        >
          <Text style={style.flatten(["subtitle2", "color-text-black-medium"])}>
            Staked
          </Text>
          <View style={style.get("flex-1")} />
          <Text style={style.flatten(["body2", "color-text-black-medium"])}>
            {staked.trim(true).shrink(true).maxDecimals(6).toString()}
          </Text>
        </View>
        <View
          style={style.flatten([
            "flex-row",
            "items-center",
            "margin-bottom-12",
          ])}
        >
          <Text style={style.flatten(["subtitle2", "color-text-black-medium"])}>
            Rewards
          </Text>
          <View style={style.get("flex-1")} />
          <Text style={style.flatten(["body2", "color-text-black-medium"])}>
            {rewards.trim(true).shrink(true).maxDecimals(6).toString()}
          </Text>
        </View>
        <View style={style.flatten(["flex-row", "items-center"])}>
          <Button
            containerStyle={style.flatten(["flex-1"])}
            mode="outline"
            text="Switch Validator"
            onPress={() => {
              smartNavigation.navigateSmart("Redelegate", { validatorAddress });
            }}
          />
          <View style={style.flatten(["width-card-gap"])} />
          <Button
            containerStyle={style.flatten(["flex-1"])}
            text="Unstake"
            onPress={() => {
              smartNavigation.navigateSmart("Undelegate", { validatorAddress });
            }}
          />
        </View>
      </CardBody>
    </Card>
  );
});
