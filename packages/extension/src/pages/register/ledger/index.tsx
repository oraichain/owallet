import React, { FunctionComponent } from 'react';
import { RegisterConfig } from '@owallet/hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Form } from 'reactstrap';
import useForm from 'react-hook-form';
import style from '../style.module.scss';
import { Input, PasswordInput } from '../../../components/form';
import { AdvancedBIP44Option, useBIP44Option } from '../advanced-bip44';
import { BackButton } from '../index';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../stores';

export const TypeImportLedger = 'import-ledger';

interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

export const ImportLedgerIntro: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const { analyticsStore } = useStore();
  return (
    <Button
      color=""
      block
      onClick={(e) => {
        e.preventDefault();

        registerConfig.setType(TypeImportLedger);
        analyticsStore.logEvent('Import account started', {
          registerType: 'ledger'
        });
      }}
      className={style.importWalletBtn}
    >
      <FormattedMessage id="register.ledger.title" />
    </Button>
  );
});

export const ImportLedgerPage: FunctionComponent<{
  registerConfig: RegisterConfig;
}> = observer(({ registerConfig }) => {
  const intl = useIntl();
  const { chainStore, analyticsStore } = useStore();
  const bip44Option = useBIP44Option(chainStore?.current?.coinType ?? 118);

  const { register, handleSubmit, getValues, errors } = useForm<FormData>({
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: ''
    }
  });

  return (
    <div>
      <div className={style.title}>
        {intl.formatMessage({
          id: 'register.name'
        })}
      </div>
      <Form
        className={style.formContainer}
        onSubmit={handleSubmit(async (data: FormData) => {
          try {
            const result = await registerConfig.createLedger(
              data.name,
              data.password,
              bip44Option.bip44HDPath
            );
            console.log(result, 'result create ledger ====');
            analyticsStore.setUserProperties({
              registerType: 'ledger',
              accountType: 'ledger'
            });
          } catch (e) {
            console.log('ERROR ON HANDLE SUBMIT CREATE LEDGER', e);
            alert(e.message ? e.message : e.toString());
            registerConfig.clear();
          }
        })}
      >
        <Input
          label={intl.formatMessage({
            id: 'register.name'
          })}
          styleInputGroup={{
            border: '1px solid rgba(8, 4, 28, 0.12)'
          }}
          type="text"
          name="name"
          ref={register({
            required: intl.formatMessage({
              id: 'register.name.error.required'
            })
          })}
          error={errors.name && errors.name.message}
        />
        {registerConfig.mode === 'create' ? (
          <React.Fragment>
            <PasswordInput
              label={intl.formatMessage({
                id: 'register.create.input.password'
              })}
              styleInputGroup={{
                border: '1px solid rgba(8, 4, 28, 0.12)'
              }}
              name="password"
              ref={register({
                required: intl.formatMessage({
                  id: 'register.create.input.password.error.required'
                }),
                validate: (password: string): string | undefined => {
                  if (password.length < 8) {
                    return intl.formatMessage({
                      id: 'register.create.input.password.error.too-short'
                    });
                  }
                }
              })}
              error={errors.password && errors.password.message}
            />
            <PasswordInput
              label={intl.formatMessage({
                id: 'register.create.input.confirm-password'
              })}
              styleInputGroup={{
                border: '1px solid rgba(8, 4, 28, 0.12)'
              }}
              style={{ position: 'relative' }}
              name="confirmPassword"
              ref={register({
                required: intl.formatMessage({
                  id: 'register.create.input.confirm-password.error.required'
                }),
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== getValues()['password']) {
                    return intl.formatMessage({
                      id: 'register.create.input.confirm-password.error.unmatched'
                    });
                  }
                }
              })}
              error={errors.confirmPassword && errors.confirmPassword.message}
            />
          </React.Fragment>
        ) : null}
        <AdvancedBIP44Option bip44Option={bip44Option} />
        <Button
          color=""
          type="submit"
          block
          data-loading={registerConfig.isLoading}
          className={style.nextBtn}
        >
          <FormattedMessage id="register.create.button.next" />
        </Button>
      </Form>
      <BackButton
        onClick={() => {
          registerConfig.clear();
        }}
      />
    </div>
  );
});
