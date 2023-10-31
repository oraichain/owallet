import React, { FunctionComponent, useEffect } from 'react';

import { EmptyLayout } from '../../layouts/empty-layout';

import { observer } from 'mobx-react-lite';

import style from './style.module.scss';

import { Button } from 'reactstrap';

import { FormattedMessage } from 'react-intl';

import { RegisterOption, useRegisterConfig } from '@owallet/hooks';
import { useStore } from '../../stores';
import { NewMnemonicIntro, NewMnemonicPage, TypeNewMnemonic } from './mnemonic';
import {
  RecoverMnemonicIntro,
  RecoverMnemonicPage,
  TypeRecoverMnemonic
} from './mnemonic';
import {
  ImportLedgerIntro,
  ImportLedgerPage,
  TypeImportLedger
} from './ledger';
import {
  ImportSocialIntro,
  ImportSocialPage,
  TypeImportSocial
} from './social';
import { WelcomePage } from './welcome';

export const AdditionalSignInPrepend: RegisterOption[] | undefined = undefined;

export enum NunWords {
  WORDS12,
  WORDS24
}

export const BackButton: FunctionComponent<{ onClick: () => void }> = ({
  onClick
}) => {
  return (
    <div className={style.backButton}>
      <Button color="link" onClick={onClick} style={{ color: '#8f63ec' }}>
        <i className="fas fa-angle-left" style={{ marginRight: '8px' }} />
        <FormattedMessage id="register.button.back" />
      </Button>
    </div>
  );
};

export const RegisterPage: FunctionComponent = observer(() => {
  useEffect(() => {
    document.body.setAttribute('data-centered', 'true');

    return () => {
      document.body.removeAttribute('data-centered');
    };
  }, []);

  const { keyRingStore } = useStore();

  const registerConfig = useRegisterConfig(keyRingStore, [
    ...(AdditionalSignInPrepend ?? []),
    {
      type: TypeNewMnemonic,
      intro: NewMnemonicIntro,
      page: NewMnemonicPage
    },
    {
      type: TypeRecoverMnemonic,
      intro: RecoverMnemonicIntro,
      page: RecoverMnemonicPage
    },
    {
      type: TypeImportLedger,
      intro: ImportLedgerIntro,
      page: ImportLedgerPage
    }
    // {
    //   type: TypeImportSocial,
    //   intro: ImportSocialIntro,
    //   page: ImportSocialPage
    // }
  ]);
  return (
    <EmptyLayout
      className={style.container}
      style={{
        justifyContent:
          registerConfig.isIntro || registerConfig.isFinalized
            ? 'center'
            : 'start'
      }}
    >
      <div className={style.logoContainer}>
        <div>
          <img
            className={style.icon}
            src={require('../../public/assets/orai_wallet_logo.png')}
            alt="logo"
          />
        </div>
        <div className={style.logoInnerContainer}>
          <img
            className={style.logo}
            src={require('../../public/assets/logo.svg')}
            alt="logo"
          />
          <div className={style.paragraph}>Cosmos x EVM in one Wallet</div>
        </div>
      </div>
      {registerConfig.render()}
      {registerConfig.isFinalized ? <WelcomePage /> : null}
      {registerConfig.isIntro ? (
        <div className={style.subContent}>
          {/* <FormattedMessage
            id="register.intro.sub-content"
            values={{
              br: <br />
            }}
          /> */}
        </div>
      ) : null}
    </EmptyLayout>
  );
});
