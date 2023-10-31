import React, { FunctionComponent, useEffect, useRef, useState } from 'react';

import { PasswordInput } from '../../components/form';

import { Button, Form } from 'reactstrap';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { Banner } from '../../components/banner';
import useForm from 'react-hook-form';

import { EmptyLayout } from '../../layouts/empty-layout';

import style from './style.module.scss';

import { FormattedMessage, useIntl } from 'react-intl';
import { useInteractionInfo } from '@owallet/hooks';
import { useHistory } from 'react-router';
import delay from 'delay';
import { text } from 'stream/consumers';

interface FormData {
  password: string;
}

export const LockPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const history = useHistory();

  const passwordRef = useRef<HTMLInputElement | null>();

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: ''
    }
  });

  const { keyRingStore } = useStore();

  const [loading, setLoading] = useState(false);

  const interactionInfo = useInteractionInfo(() => {
    keyRingStore.rejectAll();
  });

  useEffect(() => {
    if (passwordRef.current) {
      // Focus the password input on enter.
      passwordRef.current.focus();
    }
  }, []);

  return (
    <EmptyLayout style={{ height: '100%' }}>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async data => {
          setLoading(true);
          try {
            await keyRingStore.unlock(data.password, true);
            if (interactionInfo.interaction) {
              if (!interactionInfo.interactionInternal) {
                // XXX: If the connection doesn't have the permission,
                //      permission service tries to grant the permission right after unlocking.
                //      Thus, due to the yet uncertain reason, it requests new interaction for granting permission
                //      before the `window.close()`. And, it could make the permission page closed right after page changes.
                //      Unfortunately, I still don't know the exact cause.
                //      Anyway, for now, to reduce this problem, jsut wait small time, and close the window only if the page is not changed.
                await delay(100);
                if (window.location.href.includes('#/unlock')) {
                  window.close();
                }
              } else {
                history.replace('/');
              }
            }
          } catch (e) {
            console.log('Fail to decrypt: ' + e.message);
            setError(
              'password',
              'invalid',
              intl.formatMessage({
                id: 'lock.input.password.error.invalid'
              })
            );
            setLoading(false);
          }
        })}
      >
        <Banner
          icon={require('../../public/assets/orai_wallet_logo.png')}
          logo={require('../../public/assets/logo.svg')}
          subtitle="Cosmos x EVM in one Wallet"
        />
        <PasswordInput
          label={intl.formatMessage({
            id: 'lock.input.password'
          })}
          styleInputGroup={{
            border: '1px solid rgba(8, 4, 28, 0.12)'
          }}
          name="password"
          error={errors.password && errors.password.message}
          ref={ref => {
            passwordRef.current = ref;

            register({
              required: intl.formatMessage({
                id: 'lock.input.password.error.required'
              })
            })(ref);
          }}
          placeholder="Enter your account password"
        />
        <Button type="submit" color="primary" block data-loading={loading} className={style.unlockBtn}>
          <FormattedMessage id="lock.button.unlock" />
        </Button>
      </Form>
    </EmptyLayout>
  );
});
