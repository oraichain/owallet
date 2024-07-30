import React, { FC } from "react";
import { observer } from "mobx-react-lite";
import styles from "./style.module.scss";
import { HeaderModal } from "../components/header-modal";
import SlidingPane from "react-sliding-pane";
import { formatAddress, getFavicon } from "@owallet/common";
import classnames from "classnames";

export const ModalSiteConnected: FC<{
  isOpen: boolean;
  isActive: boolean;
  onRequestClose: () => void;
  url: string;
}> = observer(({ isOpen, isActive, onRequestClose, url }) => {
  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={classnames(styles.modalNetwork, styles.modalSiteConnect)}
    >
      <div className={styles.contentWrap}>
        <HeaderModal title={""} onRequestClose={onRequestClose} />
        <div className={styles.topBox}>
          <div className={styles.avatar}>
            <img className={styles.imgAvatar} src={getFavicon(url)} />
          </div>
          <div className={styles.wrapText}>
            <span className={styles.titleWallet}>{url || "..."}</span>
          </div>
        </div>
        <span className={styles.titlePermision}>Permissions:</span>
        <br />
        <span className={styles.subTitlePermision}>
          {"View your wallet address"}
        </span>
        <br />
        {isActive && (
          <span className={styles.subTitlePermision}>
            {"Be able to request signatures for transactions"}
          </span>
        )}
      </div>
    </SlidingPane>
  );
});
