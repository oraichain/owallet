import React, { FunctionComponent, useEffect } from "react";
import { useHistory } from "react-router";
import { Alert } from "reactstrap";
import style from "./style.module.scss";
import { EmptyLayout } from "../../../layouts/empty-layout";
import { FormattedMessage } from "react-intl";
import { useInteractionInfo } from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Button } from "../../../components/common/button";
import classnames from "classnames";
import { Text } from "../../../components/common/text";
import colors from "../../../theme/colors";

export const ChainSuggestedPage: FunctionComponent = observer(() => {
  const { chainSuggestStore, analyticsStore } = useStore();
  const history = useHistory();

  const interactionInfo = useInteractionInfo(() => {
    chainSuggestStore.rejectAll();
  });

  useEffect(() => {
    if (chainSuggestStore.waitingSuggestedChainInfo) {
      analyticsStore.logEvent("Chain suggested", {
        chainId: chainSuggestStore.waitingSuggestedChainInfo.data.chainId,
        chainName: chainSuggestStore.waitingSuggestedChainInfo.data.chainName,
        rpc: chainSuggestStore.waitingSuggestedChainInfo.data.rpc,
        rest: chainSuggestStore.waitingSuggestedChainInfo.data.rest,
      });
    }
  }, [analyticsStore, chainSuggestStore.waitingSuggestedChainInfo]);

  return (
    <EmptyLayout style={{ height: "100%", paddingTop: "80px" }}>
      <div className={style.container}>
        <img
          src={require("assets/images/img_owallet.png")}
          alt="logo"
          style={{ height: "92px", maxWidth: 92, margin: "0 auto" }}
        />
        {/* <h1 className={style.header}> */}
        <Text size={22} weight={"600"} color={colors["neutral-text-title"]}>
          <FormattedMessage id="chain.suggested.title" />
        </Text>
        {/* </h1> */}
        <p className={style.paragraph}>
          <Text
            size={16}
            weight={"600"}
            color={colors["primary-surface-default"]}
          >
            <FormattedMessage
              id="chain.suggested.paragraph"
              values={{
                host: chainSuggestStore.waitingSuggestedChainInfo?.data.origin,
                chainId:
                  chainSuggestStore.waitingSuggestedChainInfo?.data.chainId,
                b: (...chunks: any) => <b>{chunks}</b>,
              }}
            />
          </Text>
        </p>
        <div style={{ flex: 1 }} />
        <Alert className={style.warning} color="warning">
          <div className={style.imgContainer}>
            <img
              src={require("assets/img/icons8-test-tube.svg")}
              alt="experiment"
            />
          </div>
          <div className={style.content}>
            <div className={style.title}>
              <FormattedMessage id="chain.suggested.waring.experiment.title" />
            </div>
            <div>
              <FormattedMessage id="chain.suggested.waring.experiment.paragraph" />
            </div>
          </div>
        </Alert>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            padding: 16,
            paddingTop: 0,
          }}
        >
          <Button
            containerStyle={{ marginRight: 8 }}
            className={classnames(style.button, style.rejectBtn)}
            color={"reject"}
            disabled={!chainSuggestStore.waitingSuggestedChainInfo}
            data-loading={chainSuggestStore.isLoading}
            onClick={async (e) => {
              e.preventDefault();

              await chainSuggestStore.reject();

              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                window.close();
              } else {
                history.push("/");
              }
            }}
          >
            <FormattedMessage id="chain.suggested.button.reject" />
          </Button>
          <Button
            className={classnames(style.button, style.approveBtn)}
            disabled={!chainSuggestStore.waitingSuggestedChainInfo}
            data-loading={chainSuggestStore.isLoading}
            onClick={async (e) => {
              e.preventDefault();

              await chainSuggestStore.approve();

              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                window.close();
              } else {
                history.push("/");
              }
            }}
          >
            <FormattedMessage id="chain.suggested.button.approve" />
          </Button>
        </div>
      </div>
    </EmptyLayout>
  );
});
