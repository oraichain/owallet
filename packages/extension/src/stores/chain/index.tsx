// @ts-nocheck
import { observable, action, computed, makeObservable, flow } from "mobx";

import { ChainInfoInner, ChainStore as BaseChainStore } from "@owallet/stores";

import { ChainInfo, DAPP_CONNECT_STATUS, IMultipleAsset } from "@owallet/types";
import {
  ChainInfoWithEmbed,
  SetPersistentMemoryMsg,
  GetPersistentMemoryMsg,
  GetChainInfosMsg,
  RemoveSuggestedChainInfoMsg,
  TryUpdateChainMsg,
  RequestGetDappStatusMsg,
  RequestSetDappStatusMsg,
} from "@owallet/background";
import { BACKGROUND_PORT } from "@owallet/router";

import { MessageRequester } from "@owallet/router";
import { toGenerator } from "@owallet/common";
import { makePersistable } from "mobx-persist-store";
export class ChainStore extends BaseChainStore<ChainInfoWithEmbed> {
  @observable
  protected _selectedChainId: string;
  @observable
  protected _selectedFee: string = "average";
  @observable
  protected _isAllNetwork: boolean = false;
  @observable
  protected _hideDust: boolean = true;
  @observable
  protected _hideTestnet: boolean = false;

  @observable
  protected _multipleAssets: IMultipleAsset = {
    totalPriceBalance: "0",
    dataTokens: [],
    dataTokensByChain: null,
  };

  @observable
  protected _isInitializing: boolean = false;
  protected deferChainIdSelect: string = "";

  constructor(
    embedChainInfos: ChainInfo[],
    protected readonly requester: MessageRequester,
    initChain?: string
  ) {
    super(
      embedChainInfos.map((chainInfo) => {
        return {
          ...chainInfo,
          ...{
            embeded: true,
          },
        };
      })
    );

    this._selectedChainId = initChain ?? embedChainInfos[0].chainId;

    makeObservable(this);

    makePersistable(this, {
      name: "ChainStore",
      properties: [
        "_isAllNetwork",
        "_multipleAssets",
        "_hideDust",
        "_hideTestnet",
        "_selectedFee",
      ],
      storage: window.localStorage,
    }).then(action((persistStore) => {}));
    this.init();
  }

  get isInitializing(): boolean {
    return this._isInitializing;
  }

  get isAllNetwork(): boolean {
    return this._isAllNetwork;
  }
  get selectedFee(): string {
    return this._selectedFee;
  }
  get multipleAssets(): IMultipleAsset {
    return this._multipleAssets;
  }
  get isHideDust(): boolean {
    return this._hideDust;
  }
  get isHideTestnet(): boolean {
    return this._hideTestnet;
  }

  get selectedChainId(): string {
    return this._selectedChainId;
  }

  @action
  setIsAllNetwork(isAll: boolean) {
    this._isAllNetwork = isAll;
  }
  @action
  setSelectedFee(fee: string) {
    this._selectedFee = fee;
  }
  @action
  setIsHideDust(isHide: boolean) {
    this._hideDust = isHide;
  }
  @action
  setIsHideTestnet(isHide: boolean) {
    this._hideTestnet = isHide;
  }
  @action
  setMultipleAsset(data: IMultipleAsset) {
    this._multipleAssets = data;
  }
  @action
  selectChain(chainId: string) {
    if (this._isInitializing) {
      this.deferChainIdSelect = chainId;
    }
    this._selectedChainId = chainId;
  }

  @computed
  get current(): ChainInfoInner<ChainInfoWithEmbed> {
    if (this.hasChain(this._selectedChainId)) {
      return this.getChain(this._selectedChainId);
    }

    return this.chainInfos[0];
  }

  @flow
  *saveLastViewChainId() {
    // Save last view chain id to persistent background
    const msg = new SetPersistentMemoryMsg({
      lastViewChainId: this._selectedChainId,
    });
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
  @flow
  *getDappStatusConnect() {
    const msg = new RequestGetDappStatusMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    return result;
  }
  @flow
  *setDappStatusConnect(status: DAPP_CONNECT_STATUS) {
    const msg = new RequestSetDappStatusMsg(status);
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    return result;
  }

  @flow
  protected *init() {
    this._isInitializing = true;
    yield this.getChainInfosFromBackground();

    // Get last view chain id to persistent background
    const msg = new GetPersistentMemoryMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    if (!this.deferChainIdSelect) {
      if (result && result.lastViewChainId) {
        this.selectChain(result.lastViewChainId);
      }
    }
    this._isInitializing = false;

    if (this.deferChainIdSelect) {
      this.selectChain(this.deferChainIdSelect);
      this.deferChainIdSelect = "";
    }
  }

  @flow
  protected *getChainInfosFromBackground() {
    const msg = new GetChainInfosMsg();
    const result = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );
    this.setChainInfos(result.chainInfos);
  }

  @flow
  *removeChainInfo(chainId: string) {
    const msg = new RemoveSuggestedChainInfoMsg(chainId);
    const chainInfos = yield* toGenerator(
      this.requester.sendMessage(BACKGROUND_PORT, msg)
    );

    this.setChainInfos(chainInfos);
  }

  @flow
  *tryUpdateChain(chainId: string) {
    const msg = new TryUpdateChainMsg(chainId);
    yield this.requester.sendMessage(BACKGROUND_PORT, msg);
    yield this.getChainInfosFromBackground();
  }
}
