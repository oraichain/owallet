import React, { FunctionComponent, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { SignModal } from '../../modals/sign';
import { LedgerGranterModal } from '../../modals/ledger';
import { navigationRef } from '../../router/root';
import { HomeBaseModal } from '../../modals/home-base';
import { SignEthereumModal } from '../../modals/sign/sign-ethereum';
import { SignTronModal } from '../../modals/sign/sign-tron';

export const InteractionModalsProivder: FunctionComponent = observer(
  ({ children }) => {
    const {
      ledgerInitStore,
      permissionStore,
      signInteractionStore,
      modalStore
    } = useStore();

    useEffect(() => {
      for (const data of permissionStore.waitingDatas) {
        // Currently, there is no modal to permit the permission of external apps.
        // All apps should be embeded explicitly.
        // If such apps needs the permissions, add these origins to the privileged origins.
        if (data.data.origins.length !== 1) {
          permissionStore.reject(data.id);
        }
      }
    }, [permissionStore, permissionStore.waitingDatas]);

    return (
      <React.Fragment>
        {ledgerInitStore.isInitNeeded ? (
          <LedgerGranterModal
            isOpen={true}
            close={() => ledgerInitStore.abortAll()}
          />
        ) : null}
        {signInteractionStore.waitingData ? (
          <SignModal
            isOpen={true}
            close={() => signInteractionStore.rejectAll()}
          />
        ) : null}
        {signInteractionStore.waitingEthereumData ? (
          <SignEthereumModal
            isOpen={true}
            close={() => {
              signInteractionStore.rejectAll();
              navigationRef.current.goBack();
            }}
          />
        ) : null}
        {signInteractionStore.waitingTronData ? (
          <SignTronModal
            isOpen={true}
            close={() => signInteractionStore.rejectAll()}
          />
        ) : null}
        {modalStore.getState ? (
          <HomeBaseModal isOpen={true} close={() => modalStore.close()} />
        ) : null}

        {children}
      </React.Fragment>
    );
  }
);
