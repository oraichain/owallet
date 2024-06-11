import React from "react";
import styles from "./style.module.scss";

export const InfoAccountCard = () => {
  return (
    <div className={styles.containerInfoAccountCard}>
      <div className={styles.topHeaderInfoAcc}>
        <div className={styles.selectAccount}>
          <img
            className={styles.imgWallet}
            src={require("../../../public/assets/images/default-avatar.png")}
          />
          <span className={styles.nameWallet}>Wallet 1</span>
          <img
            className={styles.arrDown}
            src={require("../../../public/assets/images/tdesign_chevron_down.svg")}
          />
        </div>
        <div className={styles.blockCopyAddress}>
          <img
            className={styles.iconCopy}
            src={require("../../../public/assets/images/owallet_copy.svg")}
          />
          <span className={styles.nameCopy}>Copy address</span>
        </div>
      </div>
      <div className={styles.bodyBalance}>
        <span className={styles.textBalance}>$38,032.32</span>
      </div>
      <div className={styles.btnsSendReceived}>
        <div className={styles.btnWrap}>
          <span className={styles.txt}>Receive</span>
        </div>
        <div className={styles.btnWrap}>
          <span className={styles.txt}>Send</span>
        </div>
      </div>
    </div>
  );
};