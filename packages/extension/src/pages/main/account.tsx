import React, { FunctionComponent, useCallback } from 'react';

import { Address } from '../../components/address';
import { Address as Add } from '@owallet/crypto';
import styleAccount from './account.module.scss';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useNotification } from '../../components/notification';
import { useIntl } from 'react-intl';
import { WalletStatus } from '@owallet/stores';
import { TRON_ID, getBase58Address } from '@owallet/common';

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, keyRingStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const selected = keyRingStore?.multiKeyStoreInfo?.find((keyStore) => keyStore?.selected);
  const intl = useIntl();
  const checkTronNetwork = chainStore.current.chainId === TRON_ID;
  const ledgerAddress =
    keyRingStore.keyRingType == 'ledger'
      ? checkTronNetwork
        ? keyRingStore?.keyRingLedgerAddresses?.trx
        : keyRingStore?.keyRingLedgerAddresses?.eth
      : '';

  const evmAddress =
    (accountInfo.hasEvmosHexAddress || chainStore.current.networkType === 'evm') && accountInfo.evmosHexAddress;
  const tronAddress =
    (accountInfo.hasEvmosHexAddress || chainStore.current.networkType === 'evm') && checkTronNetwork
      ? getBase58Address(accountInfo.evmosHexAddress ?? '')
      : null;
  const notification = useNotification();

  const copyAddress = useCallback(
    async (address: string) => {
      if (accountInfo.walletStatus === WalletStatus.Loaded) {
        await navigator.clipboard.writeText(address);
        notification.push({
          placement: 'top-center',
          type: 'success',
          duration: 2,
          content: intl.formatMessage({
            id: 'main.address.copied'
          }),
          canDelete: true,
          transition: {
            duration: 0.25
          }
        });
      }
    },
    [accountInfo.walletStatus, accountInfo.bech32Address, notification, intl]
  );

  return (
    <div>
      <div className={styleAccount.containerName}>
        <div style={{ flex: 1 }} />
        <div className={styleAccount.name}>
          {accountInfo.walletStatus === WalletStatus.Loaded
            ? accountInfo.name ||
              intl.formatMessage({
                id: 'setting.keyring.unnamed-account'
              })
            : 'Loading...'}
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}></div>
      </div>
      {chainStore.current.networkType === 'cosmos' && (
        <div className={styleAccount.containerAccount}>
          <div style={{ flex: 1 }} />
          <div className={styleAccount.address} onClick={() => copyAddress(accountInfo.bech32Address)}>
            <span className={styleAccount.addressText}>
              <Address maxCharacters={22} lineBreakBeforePrefix={false}>
                {accountInfo.walletStatus === WalletStatus.Loaded && accountInfo.bech32Address
                  ? accountInfo.bech32Address
                  : '...'}
              </Address>
            </span>
            <div style={{ width: 6 }} />
            <img src={require('../../public/assets/img/filled.svg')} alt="filled" width={16} height={16} />
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )}
      {(accountInfo.hasEvmosHexAddress || chainStore.current.networkType === 'evm') && (
        <div
          className={styleAccount.containerAccount}
          style={{
            marginTop: '2px',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: 1 }} />
          <div
            className={styleAccount.address}
            style={{ marginBottom: '6px' }}
            onClick={() => copyAddress(keyRingStore.keyRingType !== 'ledger' ? evmAddress : ledgerAddress)}
          >
            {checkTronNetwork && !accountInfo.isNanoLedger && (
              <span
                style={{
                  fontWeight: 'bold'
                }}
              >
                Evmos:
              </span>
            )}
            <span className={styleAccount.addressText}>
              {keyRingStore.keyRingType !== 'ledger' ? (
                <Address isRaw={true} tooltipAddress={evmAddress}>
                  {accountInfo.walletStatus === WalletStatus.Loaded &&
                    accountInfo.evmosHexAddress &&
                    Add.shortAddress(evmAddress)}
                </Address>
              ) : (
                <Address isRaw={true} tooltipAddress={ledgerAddress}>
                  {Add.shortAddress(ledgerAddress)}
                </Address>
              )}
            </span>
            <div style={{ width: 6 }} />
            <img src={require('../../public/assets/img/filled.svg')} alt="filled" width={16} height={16} />
          </div>
          {checkTronNetwork && !accountInfo.isNanoLedger && tronAddress && (
            <div
              className={styleAccount.address}
              style={{ marginBottom: '6px' }}
              onClick={() => copyAddress(tronAddress)}
            >
              <span
                style={{
                  fontWeight: 'bold'
                }}
              >
                Base58:
              </span>
              <span className={styleAccount.addressText}>
                <Address isRaw={true} tooltipAddress={tronAddress}>
                  {Add.shortAddress(tronAddress)}
                </Address>
              </span>
              <div style={{ width: 6 }} />
              <img src={require('../../public/assets/img/filled.svg')} alt="filled" width={16} height={16} />
            </div>
          )}

          <div style={{ flex: 1 }} />
        </div>
      )}
      <div className={styleAccount.coinType}>
        {' '}
        {`Coin type: m/44'/${
          (keyRingStore.keyRingType == 'ledger'
            ? chainStore?.current?.bip44?.coinType
            : selected?.bip44HDPath?.coinType ?? chainStore?.current?.bip44?.coinType) +
          "'/" +
          (selected?.bip44HDPath?.account ?? '0') +
          "'/" +
          (selected?.bip44HDPath?.change ?? '0') +
          '/' +
          (selected?.bip44HDPath?.addressIndex ?? '0')
        }`}
      </div>
    </div>
  );
});
