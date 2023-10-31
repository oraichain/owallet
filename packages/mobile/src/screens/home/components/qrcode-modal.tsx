import React, { FunctionComponent, useMemo } from 'react';
import { Button, OWButton } from '../../../components/button';
import { Share, StyleSheet, View } from 'react-native';
import { CardModal } from '../../../modals/card';
import { AddressCopyable } from '../../../components/address-copyable';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, typography } from '../../../themes';
import { AccountWithAll } from '@owallet/stores';
import { Text } from '@src/components/text';
import { Address } from '@owallet/crypto';
import { TRON_ID, getBase58Address } from '@owallet/common';

export const AddressQRCodeModal: FunctionComponent<{
  account?: AccountWithAll;
  chainStore?: any;
}> = ({ account, chainStore }) => {
  console.log('chainStore', chainStore);

  let addressToshow = '';
  if (chainStore?.networkType === 'cosmos') {
    addressToshow = account.bech32Address;
  } else {
    if (chainStore?.chainId === TRON_ID) {
      addressToshow = getBase58Address(account.evmosHexAddress);
    } else {
      addressToshow = account.evmosHexAddress;
    }
  }

  return (
    <View
      style={{
        alignItems: 'center'
      }}
    >
      <Text
        style={{
          ...typography.h6,
          color: colors['primary-text'],
          fontWeight: '900'
        }}
      >{`Receive`}</Text>
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            ...typography.h6,
            color: colors['gray-400'],
            fontWeight: '900',
            marginVertical: spacing['16']
          }}
        >{`Scan QR Code or copy below address`}</Text>
        <AddressCopyable address={addressToshow} maxCharacters={22} />
        <View style={{ marginVertical: spacing['32'] }}>
          {account.bech32Address ? (
            <QRCode size={200} value={addressToshow} />
          ) : (
            <View
              style={{
                height: 200,
                width: 200,
                backgroundColor: colors['disabled']
              }}
            />
          )}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <OWButton
            label="Share Address"
            loading={account.bech32Address === ''}
            disabled={account.bech32Address === ''}
            onPress={() => {
              Share.share({
                message: addressToshow
              }).catch((e) => {
                console.log(e);
              });
            }}
          />
        </View>
      </View>
    </View>
  );
};
