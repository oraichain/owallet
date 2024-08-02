import React, { FC, useEffect, useState } from "react";
import SlidingPane from "react-sliding-pane";
import styles from "./style.module.scss";
import { SearchInput } from "../components/search-input";
import classnames from "classnames";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import {
  COINTYPE_NETWORK,
  ChainIdEnum,
  getKeyDerivationFromAddressType,
  unknownToken,
} from "@owallet/common";
import { initPrice } from "../../../hooks/use-multiple-assets";
import { HeaderModal } from "../components/header-modal";
import { ViewRawToken, ViewTokenData } from "@owallet/types";
import { CoinPretty, PricePretty } from "@owallet/unit";

import { useConfirm } from "components/confirm";
import { toast } from "react-toastify";

export const ModalNetwork: FC<{
  isOpen: boolean;
  onRequestClose: () => void;
  isHideAllNetwork?: boolean;
}> = observer(({ isOpen, isHideAllNetwork, onRequestClose }) => {
  const [keyword, setKeyword] = useState("");
  const { chainStore, accountStore, priceStore, keyRingStore } = useStore();
  const onChangeInput = (e) => {
    setKeyword(e.target.value);
  };
  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const [tab, setTab] = useState<(typeof typeNetwork)[0]>(typeNetwork[0]);
  const activeTab = (item: (typeof typeNetwork)[0]) => {
    setTab(item);
  };
  useEffect(() => {
    if (chainStore.isHideTestnet) {
      setTab(typeNetwork[0]);
    }
  }, [chainStore.isHideTestnet]);
  const sortChainsByPrice = (chains) => {
    return chains.sort(
      (a, b) =>
        Number(b.balance?.toDec()?.toString()) -
        Number(a.balance?.toDec()?.toString())
    );
  };
  const dataTokens = [...(chainStore.multipleAssets.dataTokens || [])];
  let totalPrice = initPrice;
  const dataTokensByChainMap = new Map<ChainIdEnum | string, ViewTokenData>();
  (dataTokens || []).map((item: ViewRawToken, index) => {
    const coinData = new CoinPretty(item.token.currency, item.token.amount);
    const priceData = priceStore.calculatePrice(coinData);
    totalPrice = totalPrice.add(priceData || initPrice);

    //caculator total price by chainID
    dataTokensByChainMap.set(item.chainInfo.chainId, {
      ...chainStore.multipleAssets.dataTokensByChain[item.chainInfo.chainId],
      totalBalance: (
        new PricePretty(
          fiatCurrency,
          dataTokensByChainMap.get(item.chainInfo.chainId)?.totalBalance
        ) || initPrice
      )
        .add(priceData || initPrice)
        .toDec()
        .toString(),
    });
    return {
      ...item,
      price: priceData?.toDec()?.toString() || initPrice?.toDec()?.toString(),
    };
  });

  const chainsInfoWithBalance = chainStore.chainInfos.map((item, index) => {
    //@ts-ignore
    item.balance =
      new PricePretty(
        fiatCurrency,
        dataTokensByChainMap.get(item.chainId)?.totalBalance
      ) || initPrice;
    return item;
  });
  const mainnet = chainsInfoWithBalance.filter(
    (item, index) =>
      !item?.chainName?.toLowerCase()?.includes("test") &&
      item?.chainName?.toLowerCase()?.includes(keyword?.toLowerCase())
  );
  const testnet = chainsInfoWithBalance.filter(
    (item, index) =>
      item?.chainName?.toLowerCase()?.includes("test") &&
      item?.chainName?.toLowerCase()?.includes(keyword?.toLowerCase())
  );

  const confirm = useConfirm();
  const selected = keyRingStore?.multiKeyStoreInfo?.find(
    (keyStore) => keyStore?.selected
  );
  const account = accountStore.getAccount(chainStore.current.chainId);
  const chains = tab.id === typeNetwork[0].id ? mainnet : testnet;
  const switchChainLedger = async (chainInfo) => {
    if (selected?.type === "ledger") {
      const [getDevicesHID] = await Promise.all([
        window.navigator.hid.getDevices(),
        // window.navigator.usb.getDevices()
      ]);
      if (getDevicesHID.length) {
        if (
          await confirm.confirm({
            paragraph: `You are switching to ${
              COINTYPE_NETWORK[chainInfo.coinType ?? chainInfo.bip44.coinType]
            } network. Please confirm that you have ${
              COINTYPE_NETWORK[chainInfo.coinType ?? chainInfo.bip44.coinType]
            } App opened before switch network`,
            styleParagraph: {
              color: "#A6A6B0",
            },
            yes: "Yes",
            no: "No",
            styleNoBtn: {
              background: "#F5F5FA",
              border: "1px solid #3B3B45",
              color: "#3B3B45",
            },
          })
        ) {
          toast(
            `You are switching to ${
              COINTYPE_NETWORK[chainInfo.coinType ?? chainInfo.bip44.coinType]
            } network. Please confirm that you have ${
              COINTYPE_NETWORK[chainInfo.coinType ?? chainInfo.bip44.coinType]
            } App opened before switch network`,
            {
              type: "warning",
            }
          );

          const { networkType } = chainStore.getChain(chainInfo?.chainId);
          const keyDerivation = (() => {
            const keyMain = getKeyDerivationFromAddressType(
              account.addressType
            );
            if (networkType === "bitcoin") {
              return keyMain;
            }
            return "44";
          })();
          await keyRingStore.setKeyStoreLedgerAddress(
            `${keyDerivation}'/${
              chainInfo.bip44.coinType ?? chainInfo.coinType
            }'/${selected.bip44HDPath.account}'/${
              selected.bip44HDPath.change
            }/${selected.bip44HDPath.addressIndex}`,
            chainInfo.chainId
          );
        }
        await handleUpdateChain(chainInfo);
        return;
      } else {
        browser.tabs.create({
          url: `/popup.html#/confirm-ledger/${
            COINTYPE_NETWORK[chainInfo.bip44.coinType ?? chainInfo.coinType]
          }`,
        });
        return;
      }
    }
  };
  const handleUpdateChain = async (chainInfo) => {
    await keyRingStore.changeChain({
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      networkType: chainInfo.networkType,
      rpc: chainInfo?.rpc ?? chainInfo?.rest,
    });
    localStorage.setItem("initchain", chainInfo.chainId);
    chainStore.selectChain(chainInfo.chainId);
    chainStore.saveLastViewChainId();
  };
  // const account = accountStore.getAccount(chainStore.current.chainId);
  const switchChain = async (chainInfo) => {
    try {
      if (chainInfo.chainId === "isAll") {
        chainStore.setIsAllNetwork(true);
        return;
      }
      chainStore.setIsAllNetwork(false);
      if (
        chainInfo.chainId !== chainStore.current.chainId &&
        chainInfo.chainId !== "isAll"
      ) {
        await switchChainLedger(chainInfo);
        await handleUpdateChain(chainInfo);
        return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      onRequestClose();
    }
  };
  const allNetworkData =
    tab.id === typeNetwork[0].id && !isHideAllNetwork
      ? [
          {
            chainId: "isAll",
            chainName: "All Network",
            stakeCurrency: {
              coinImageUrl: require("assets/svg/Tokens.svg"),
            },
          },
        ]
      : [];
  return (
    <SlidingPane
      isOpen={isOpen}
      from="bottom"
      width="100vw"
      onRequestClose={onRequestClose}
      hideHeader={true}
      className={styles.modalNetwork}
    >
      <div className={styles.contentWrap}>
        <HeaderModal title={"CHOOSE NETWORK"} onRequestClose={onRequestClose} />
        <SearchInput
          containerClassNames={styles.containerSearchInput}
          onChange={onChangeInput}
          placeholder={"Search for a chain"}
        />
        {!chainStore.isHideTestnet ? (
          <div className={styles.containerTypeNetwork}>
            {typeNetwork.map((item, index) => (
              <div
                onClick={() => activeTab(item)}
                key={item.id}
                className={classnames([
                  styles.itemTypeNetwork,
                  tab.id === item.id
                    ? styles.activeBorderBottom
                    : styles.inactiveBorderBottom,
                ])}
              >
                <span
                  className={classnames([
                    styles.titleTxtItem,
                    tab.id === item.id
                      ? styles.activeTxtColor
                      : styles.inactiveTxtColor,
                  ])}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className={styles.containerListChain}>
          {chains?.length > 0 &&
            [...allNetworkData, ...sortChainsByPrice(chains)].map(
              (item, index) => {
                return (
                  <div
                    onClick={() => switchChain(item)}
                    key={item.chainId}
                    className={classnames([
                      styles.itemChain,
                      item.chainId ===
                      (chainStore.isAllNetwork
                        ? "isAll"
                        : chainStore.current.chainId)
                        ? styles.activeItemChain
                        : null,
                    ])}
                  >
                    <div className={styles.leftBlockHuge}>
                      <div className={styles.wrapImgChain}>
                        <img
                          className={styles.imgChain}
                          src={
                            item?.stakeCurrency?.coinImageUrl ||
                            unknownToken.coinImageUrl
                          }
                        />
                      </div>
                      <div className={styles.rightBlock}>
                        <span className={styles.titleName}>
                          {item.chainName}
                        </span>
                        <span className={styles.subTitlePrice}>
                          {item.chainId === "isAll"
                            ? (totalPrice || initPrice)?.toString()
                            : (item.balance || initPrice)?.toString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.rightBlockHuge}>
                      <input
                        id={item.chainId}
                        defaultChecked={
                          item.chainId ===
                          (chainStore.isAllNetwork
                            ? "isAll"
                            : chainStore.current.chainId)
                        }
                        name={"chain"}
                        className={styles.radioInput}
                        type={"radio"}
                      />
                    </div>
                  </div>
                );
              }
            )}
        </div>
      </div>
    </SlidingPane>
  );
});

const typeNetwork = [
  {
    title: "Mainnet",
    id: 1,
  },
  {
    title: "Testnet",
    id: 2,
  },
];
