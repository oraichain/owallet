import React, { FunctionComponent, useCallback } from 'react';

import { Address } from '../../components/address';

import styleAccount from './account.module.scss';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { useNotification } from '../../components/notification';
import { useIntl } from 'react-intl';
import { WalletStatus } from '@owallet/stores';

export const AccountView: FunctionComponent = observer(() => {
  const { accountStore, chainStore, keyRingStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);
  const selected = keyRingStore?.multiKeyStoreInfo?.find(
    (keyStore) => keyStore?.selected
  );

  const intl = useIntl();

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
        <div style={{ flex: 1, textAlign: 'right' }}>
          {/* {chainStore.current.raw.txExplorer?.accountUrl && (
            <a
              target="_blank"
              href={chainStore.current.raw.txExplorer.accountUrl.replace(
                '{address}',
                // accountInfo.bech32Address
                chainStore.current.networkType === 'evm'
                  ? accountInfo.evmosHexAddress
                  : accountInfo.bech32Address
              )}
              title={intl.formatMessage({ id: 'setting.explorer' })}
            >
              <i className="fas fa-external-link-alt"></i>
            </a>
          )} */}
        </div>
      </div>
      {chainStore.current.networkType === 'cosmos' && (
        <div className={styleAccount.containerAccount}>
          <div style={{ flex: 1 }} />
          <div
            className={styleAccount.address}
            onClick={() => copyAddress(accountInfo.bech32Address)}
          >
            <span className={styleAccount.addressText}>
              <Address maxCharacters={22} lineBreakBeforePrefix={false}>
                {accountInfo.walletStatus === WalletStatus.Loaded &&
                accountInfo.bech32Address
                  ? accountInfo.bech32Address
                  : '...'}
              </Address>
            </span>
            <div style={{ width: 6 }} />
            <img
              src={require('../../public/assets/img/filled.svg')}
              alt="filled"
              width={16}
              height={16}
            />
          </div>
          <div style={{ flex: 1 }} />
        </div>
      )}
      {(accountInfo.hasEvmosHexAddress ||
        chainStore.current.networkType === 'evm') && (
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
            onClick={() => copyAddress(accountInfo.evmosHexAddress)}
          >
            <span className={styleAccount.addressText}>
              <Address
                isRaw={true}
                tooltipAddress={accountInfo.evmosHexAddress}
              >
                {accountInfo.walletStatus === WalletStatus.Loaded &&
                accountInfo.evmosHexAddress
                  ? accountInfo.evmosHexAddress.length === 42
                    ? `${accountInfo.evmosHexAddress.slice(
                        0,
                        10
                      )}...${accountInfo.evmosHexAddress.slice(-8)}`
                    : accountInfo.evmosHexAddress
                  : '...'}
              </Address>
            </span>
            <div style={{ width: 6 }} />
            <img
              src={require('../../public/assets/img/filled.svg')}
              alt="filled"
              width={16}
              height={16}
            />
          </div>
          {/* <div
            className={styleAccount.address}
            onClick={() => copyAddress(accountInfo.evmosHexAddress)}
          >
            <span className={styleAccount.addressText}>
              <Address isRaw={true} tooltipAddress={accountInfo.bech32Address}>
                {accountInfo.walletStatus === WalletStatus.Loaded &&
                accountInfo.bech32Address
                  ? `${accountInfo.bech32Address.slice(
                      0,
                      15
                    )}...${accountInfo.bech32Address.slice(-10)}`
                  : accountInfo.bech32Address}
              </Address>
            </span>
          </div> */}
          <div style={{ flex: 1 }} />
        </div>
      )}
      <div className={styleAccount.coinType}>
        {' '}
        {`Coin type: m/44'/${
          (selected?.bip44HDPath?.coinType ?? chainStore?.current?.bip44?.coinType ?? '118') +
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
