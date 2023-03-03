/* eslint-disable react/display-name */

import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { CoinUtils, Coin } from '@owallet/unit';
import { AppCurrency, Currency } from '@owallet/types';
import yaml from 'js-yaml';
import { CoinPrimitive } from '@owallet/stores';
import { CText as Text } from '../../components/text';
import { useStyle } from '../../styles';
import { Bech32Address } from '@owallet/cosmos';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Hypher from 'hypher';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import english from 'hyphenation.en-us';
import { useStore } from '../../stores';
import { Buffer } from 'buffer';
import { observer } from 'mobx-react-lite';
import { FormattedMessage } from 'react-intl';
import { Badge } from '../../components/badge';
import { StyleSheet, View } from 'react-native';
import { colors, typography } from '../../themes';

const h = new Hypher(english);

// https://zpl.fi/hyphenation-in-react-native/
function hyphen(text: string): string {
  return h.hyphenateText(text);
}

export interface MessageObj {
  readonly type: string;
  readonly value: unknown;
}

export interface MsgSend {
  value: {
    amount: [
      {
        amount: string;
        denom: string;
      }
    ];
    from_address: string;
    to_address: string;
  };
}

export interface MsgTransfer {
  value: {
    source_port: string;
    source_channel: string;
    token: {
      denom: string;
      amount: string;
    };
    sender: string;
    receiver: string;
    timeout_height: {
      revision_number: string | undefined;
      revision_height: string;
    };
  };
}

export interface MsgDelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgUndelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgWithdrawDelegatorReward {
  value: {
    delegator_address: string;
    validator_address: string;
  };
}

export interface MsgBeginRedelegate {
  value: {
    amount: {
      amount: string;
      denom: string;
    };
    delegator_address: string;
    validator_dst_address: string;
    validator_src_address: string;
  };
}

export interface MsgVote {
  value: {
    proposal_id: string;
    voter: string;
    // In the stargate, option would be the enum (0: empty, 1: yes, 2: abstain, 3: no, 4: no with veto).
    option: string | number;
  };
}

export interface MsgInstantiateContract {
  value: {
    // Admin field can be omitted.
    admin?: string;
    sender: string;
    code_id: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    init_msg: object;
    init_funds: [
      {
        amount: string;
        denom: string;
      }
    ];
  };
}

// This message can be a normal cosmwasm message or a secret-wasm message.
export interface MsgExecuteContract {
  value: {
    contract: string;
    // If message is for secret-wasm, msg will be the base64 encoded and encrypted string.
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object | string;
    sender: string;
    // The field is for wasm message.
    funds?: [
      {
        amount: string;
        denom: string;
      }
    ];
    // The bottom fields are for secret-wasm message.
    sent_funds?: [
      {
        amount: string;
        denom: string;
      }
    ];
    callback_code_hash?: string;
    callback_sig?: string | null;
  };
}

export interface MsgLink {
  value: {
    links: [
      {
        from: string;
        to: string;
      }
    ];
    address: string;
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function renderUnknownMessage(msg: object) {
  return {
    icon: undefined,
    title: 'Custom',
    content: <UnknownMsgView msg={msg} />,
    scrollViewHorizontal: true
  };
}

export function renderMsgSend(
  currencies: AppCurrency[],
  amount: CoinPrimitive[],
  toAddress: string
) {
  const receives: CoinPrimitive[] = [];
  for (const coinPrimitive of amount) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    receives.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom
    });
  }

  return {
    title: 'Send',
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Send to </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(Bech32Address.shortenAddress(toAddress, 20))}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Amount </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(
              receives
                .map(coin => {
                  return `${coin.amount} ${coin.denom}`;
                })
                .join(',')
            )}
          </Text>
        </View>
        {/* <Text>{' will receive '}</Text> */}
      </View>
    )
  };
}

export function renderMsgTransfer(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  receiver: string,
  channelId: string
) {
  const coin = new Coin(amount.denom, amount.amount);
  const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom
  };

  return {
    title: 'IBC Transfer',
    // content: (
    //   <Text>
    //     <Text>{'Send '}</Text>
    //     <Text
    //       style={{
    //         fontWeight: 'bold'
    //       }}
    //     >
    //       {hyphen(`${amount.amount} ${amount.denom}`)}
    //     </Text>
    //     <Text>{' to '}</Text>
    //     <Text style={{ fontWeight: 'bold' }}>
    //       {hyphen(Bech32Address.shortenAddress(receiver, 20))}
    //     </Text>
    //     <Text>{' on '}</Text>
    //     <Text style={{ fontWeight: 'bold' }}>{channelId}</Text>
    //   </Text>
    // )
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Transfer IBC to </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(Bech32Address.shortenAddress(receiver, 20))}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Amount </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(`${amount.amount} ${amount.denom}`)}
          </Text>
        </View>
        {/* <Text>{' will receive '}</Text> */}
      </View>
    )
  };
}

export function renderMsgBeginRedelegate(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  validatorSrcAddress: string,
  validatorDstAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom
  };

  return {
    title: 'Switch Validator',
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>From </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(Bech32Address.shortenAddress(validatorSrcAddress, 24))}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>To </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(Bech32Address.shortenAddress(validatorDstAddress, 24))}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Amount </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(`${amount.amount} ${amount.denom}`)}
          </Text>
        </View>
        {/* <Text>{' will receive '}</Text> */}
      </View>
      // <Text>
      //   <Text>{'Switch validator '}</Text>
      //   <Text style={{ fontWeight: 'bold' }}>
      //     {hyphen(`${amount.amount} ${amount.denom}`)}
      //   </Text>
      //   <Text>{' from '}</Text>
      //   <Text style={{ fontWeight: 'bold' }}>
      //     {hyphen(Bech32Address.shortenAddress(validatorSrcAddress, 24))}
      //   </Text>
      //   <Text>{' to '}</Text>
      //   <Text style={{ fontWeight: 'bold' }}>
      //     {hyphen(Bech32Address.shortenAddress(validatorDstAddress, 24))}
      //   </Text>
      // </Text>
    )
  };
}

export function renderMsgUndelegate(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  validatorAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom
  };

  return {
    title: 'Unstake',
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Unstake </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(Bech32Address.shortenAddress(validatorAddress, 24))}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Amount </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(`${amount.amount} ${amount.denom}`)}
          </Text>
        </View>
      </View>
    )
    // content: (
    //   <Text>
    //     <Text>{'Unstake '}</Text>
    //     <Text style={{ fontWeight: 'bold' }}>
    //       {hyphen(`${amount.amount} ${amount.denom}`)}
    //     </Text>
    //     <Text>{' from '}</Text>
    //     <Text style={{ fontWeight: 'bold' }}>
    //       {hyphen(Bech32Address.shortenAddress(validatorAddress, 24))}
    //     </Text>
    //     <Text>{`\n${hyphen(
    //       'Asset will be liquid after unbonding period'
    //     )}`}</Text>
    //   </Text>
    // )
  };
}

export function renderMsgDelegate(
  currencies: AppCurrency[],
  amount: CoinPrimitive,
  validatorAddress: string
) {
  const parsed = CoinUtils.parseDecAndDenomFromCoin(
    currencies,
    new Coin(amount.denom, amount.amount)
  );

  amount = {
    amount: clearDecimals(parsed.amount),
    denom: parsed.denom
  };

  return {
    title: 'Stake',
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Stake to</Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(Bech32Address.shortenAddress(validatorAddress, 24))}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Amount </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(`${amount.amount} ${amount.denom}`)}
          </Text>
        </View>
      </View>
    )
  };
}

export function renderMsgWithdrawDelegatorReward(validatorAddress: string) {
  return {
    title: 'Claim Staking Reward',
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Claim From </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {hyphen(Bech32Address.shortenAddress(validatorAddress ?? '', 20))}
          </Text>
        </View>
      </View>
    )
  };
}

export function renderMsgIBCMsgTransfer(msg: any) {
  return {
    title: 'IBC Transfer',
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>IBC Transfer</Text>
          <Text style={{ fontWeight: 'bold' }}>
            {/* {hyphen(Bech32Address.shortenAddress(validatorAddress, 20))} */}
          </Text>
        </View>
        {/* <Text>{' will receive '}</Text> */}
      </View>
    )
    // content: (
    //   <Text>
    //     <Text>{'Claim pending staking reward from '}</Text>
    //     <Text style={{ fontWeight: 'bold' }}>
    //       {hyphen(Bech32Address.shortenAddress(validatorAddress, 34))}
    //     </Text>
    //   </Text>
    // )
  };
}

export function renderMsgVote(proposalId: string, option: string | number) {
  const textualOption = (() => {
    if (typeof option === 'string') {
      return option;
    }

    switch (option) {
      case 0:
        return 'Empty';
      case 1:
        return 'Yes';
      case 2:
        return 'Abstain';
      case 3:
        return 'No';
      case 4:
        return 'No with veto';
      default:
        return 'Unspecified';
    }
  })();

  // Vote <b>{option}</b> on <b>Proposal {id}</b>

  return {
    title: 'Vote',
    content: (
      <View style={{}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Vote </Text>
          <Text style={{ fontWeight: 'bold' }}>{textualOption}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ ...styles.textInfo }}>Proposal </Text>
          <Text style={{ fontWeight: 'bold' }}>{proposalId}</Text>
        </View>
        {/* <Text>{' will receive '}</Text> */}
      </View>
    )
    // content: (
    //   <Text>
    //     <Text>{'Vote '}</Text>
    //     <Text style={{ fontWeight: 'bold' }}>{textualOption}</Text>
    //     <Text>{' on '}</Text>
    //     <Text style={{ fontWeight: 'bold' }}>{`Proposal ${proposalId}`}</Text>
    //   </Text>
    // )
  };
}

export function renderMsgExecuteContract(
  currencies: Currency[],
  sentFunds: CoinPrimitive[],
  callbackCodeHash: string | undefined,
  contract: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string
) {
  const sent: { amount: string; denom: string }[] = [];
  for (const coinPrimitive of sentFunds) {
    const coin = new Coin(coinPrimitive.denom, coinPrimitive.amount);
    const parsed = CoinUtils.parseDecAndDenomFromCoin(currencies, coin);

    sent.push({
      amount: clearDecimals(parsed.amount),
      denom: parsed.denom
    });
  }

  const isSecretWasm = callbackCodeHash != null;

  return {
    icon: 'fas fa-cog',
    title: 'Execute Wasm Contract',
    content: (
      <Text>
        <Text>
          <Text>Execute contract </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {Bech32Address.shortenAddress(contract, 26)}
          </Text>
          {sent.length > 0 ? (
            <Text>
              <Text> by sending </Text>
              <Text style={{ fontWeight: 'bold' }}>
                {sent
                  .map(coin => {
                    return `${coin.amount} ${coin.denom}`;
                  })
                  .join(',')}
              </Text>
            </Text>
          ) : undefined}
        </Text>
        {isSecretWasm && (
          <React.Fragment>
            <Badge
              color="primary"
              style={{ marginTop: '6px', marginBottom: '6px' }}
            >
              <FormattedMessage id="sign.list.message.wasm/MsgExecuteContract.content.badge.secret-wasm" />
            </Badge>
          </React.Fragment>
        )}
        <WasmExecutionMsgView msg={msg} />
      </Text>
    )
  };
}

export const WasmExecutionMsgView: FunctionComponent<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  msg: object | string;
}> = observer(({ msg }) => {
  const { chainStore, accountStore } = useStore();

  const style = useStyle();

  // TODO: Toggle open button?
  // const [isOpen, setIsOpen] = useState(true);
  // const toggleOpen = () => setIsOpen((isOpen) => !isOpen);

  const [detailsMsg, setDetailsMsg] = useState(() =>
    JSON.stringify(msg, null, 2)
  );
  const [warningMsg, setWarningMsg] = useState('');

  useEffect(() => {
    // If msg is string, it will be the message for secret-wasm.
    // So, try to decrypt.
    // But, if this msg is not encrypted via OWallet, OWallet cannot decrypt it.
    // TODO: Handle the error case. If an error occurs, rather than rejecting the signing, it informs the user that OWallet cannot decrypt it and allows the user to choose.
    if (typeof msg === 'string') {
      (async () => {
        try {
          let cipherText = Buffer.from(Buffer.from(msg, 'base64'));
          // Msg is start with 32 bytes nonce and 32 bytes public key.
          const nonce = cipherText.slice(0, 32);
          cipherText = cipherText.slice(64);

          const owallet = await accountStore
            .getAccount(chainStore.current.chainId)
            .getOWallet();
          if (!owallet) {
            throw new Error("Can't get the owallet API");
          }

          const enigmaUtils = owallet.getEnigmaUtils(
            chainStore.current.chainId
          );
          let plainText = Buffer.from(
            await enigmaUtils.decrypt(cipherText, nonce)
          );
          // Remove the contract code hash.
          plainText = plainText.slice(64);

          setDetailsMsg(
            JSON.stringify(JSON.parse(plainText.toString()), null, 2)
          );
          setWarningMsg('');
        } catch {
          setWarningMsg(
            'Failed to decrypt Secret message. This may be due to OWallet viewing key not matching the transaction viewing key.'
          );
        }
      })();
    }
  }, [accountStore, chainStore, chainStore.current.chainId, msg]);

  return (
    <Text style={style.flatten(['margin-top-8'])}>
      <Text>{`\n${detailsMsg}`}</Text>
      {warningMsg ? (
        <Text style={style.flatten(['color-danger-200'])}>{warningMsg}</Text>
      ) : null}
    </Text>
  );
});

// eslint-disable-next-line @typescript-eslint/ban-types
export const UnknownMsgView: FunctionComponent<{ msg: object }> = ({ msg }) => {
  const style = useStyle();

  const prettyMsg = useMemo(() => {
    try {
      return yaml.dump(msg);
    } catch (e) {
      console.log(e);
      return 'Failed to decode the msg';
    }
  }, [msg]);

  return (
    <Text style={style.flatten(['body3', 'color-text-black-low'])}>
      {prettyMsg}
    </Text>
  );
};

export function clearDecimals(dec: string): string {
  if (!dec.includes('.')) {
    return dec;
  }

  for (let i = dec.length - 1; i >= 0; i--) {
    if (dec[i] === '0') {
      dec = dec.slice(0, dec.length - 1);
    } else {
      break;
    }
  }
  if (dec.length > 0 && dec[dec.length - 1] === '.') {
    dec = dec.slice(0, dec.length - 1);
  }

  return dec;
}

const styles = StyleSheet.create({
  textInfo: {
    ...typography.h5,
    fontWeight: '400',
    color: colors['text-black-medium']
  }
});
