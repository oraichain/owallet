import { ChainGetter } from "@owallet/stores";
import { Ethereum } from "@owallet/types";
import { action, makeObservable, observable } from "mobx";
import { getAddress as getEthAddress } from "@ethersproject/address";
export class EthereumAccountBase {
  @observable
  protected _isSendingTx: boolean = false;

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getEthereum: () => Promise<Ethereum | undefined>
  ) {
    makeObservable(this);
  }

  @action
  setIsSendingTx(value: boolean) {
    this._isSendingTx = value;
  }
  static isEthereumHexAddressWithChecksum(hexAddress: string): boolean {
    const isHexAddress = !!hexAddress.match(/^0x[0-9A-Fa-f]*$/);
    const isChecksumAddress = !!hexAddress.match(
      /([A-F].*[a-f])|([a-f].*[A-F])/
    );
    if (!isHexAddress || hexAddress.length !== 42) {
      return false;
    }

    const checksumHexAddress = getEthAddress(hexAddress.toLowerCase());
    if (isChecksumAddress && checksumHexAddress !== hexAddress) {
      return false;
    }

    return true;
  }
}
