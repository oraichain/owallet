import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { registerModal } from '../base';
import { CardModal } from '../card';
import {
  ScrollView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useStyle } from '../../styles';
import { useStore } from '../../stores';
import { Button } from '../../components/button';
import { colors } from '../../themes';

import { observer } from 'mobx-react-lite';
import { useUnmount } from '../../hooks';

import { navigationRef } from '../../router/root';

const keyboardVerticalOffset = Platform.OS === 'ios' ? 130 : 0;

export const SignTronModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const { chainStore, signInteractionStore } = useStore();

    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    const [dataSign, setDataSign] = useState(null);

    useEffect(() => {
      console.log('waitingTronData', signInteractionStore.waitingTronData);

      if (signInteractionStore.waitingTronData) {
        setDataSign(signInteractionStore.waitingTronData);
      }
    }, []);

    const style = useStyle();

    const _onPressReject = () => {
      try {
        signInteractionStore.rejectAll();
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <CardModal>
        <KeyboardAvoidingView
          behavior="position"
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <View style={style.flatten(['margin-bottom-16'])}>
            <Text style={style.flatten(['margin-bottom-3'])}>
              <Text style={style.flatten(['subtitle3', 'color-primary'])}>
                {`1 `}
              </Text>
              <Text
                style={style.flatten(['subtitle3', 'color-text-black-medium'])}
              >
                Message
              </Text>
            </Text>
            <View
              style={style.flatten([
                'border-radius-8',
                'border-width-1',
                'border-color-border-white',
                'overflow-hidden'
              ])}
            >
              <ScrollView
                style={style.flatten(['max-height-214'])}
                persistentScrollbar={true}
              >
                <Text>{JSON.stringify(dataSign, null, 2)}</Text>
              </ScrollView>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly'
            }}
          >
            <Button
              text="Reject"
              size="large"
              containerStyle={{
                width: '40%'
              }}
              style={{
                backgroundColor: colors['red-500']
              }}
              textStyle={{
                color: colors['white']
              }}
              underlayColor={colors['danger-400']}
              loading={signInteractionStore.isLoading}
              disabled={signInteractionStore.isLoading}
              onPress={_onPressReject}
            />
            <Button
              text="Approve"
              size="large"
              disabled={signInteractionStore.isLoading}
              containerStyle={{
                width: '40%'
              }}
              textStyle={{
                color: colors['white']
              }}
              style={{
                backgroundColor: signInteractionStore.isLoading
                  ? colors['gray-400']
                  : colors['purple-900']
              }}
              loading={signInteractionStore.isLoading}
              onPress={async () => {
                try {
                  await signInteractionStore.approveTronAndWaitEnd();
                  if (
                    navigationRef.current.getCurrentRoute().name === 'Send' ||
                    navigationRef.current.getCurrentRoute().name === 'SendTron'
                  ) {
                    navigationRef.current.navigate('TxSuccessResult', {});
                  }
                } catch (error) {
                  signInteractionStore.rejectAll();
                  console.log('error approveTronAndWaitEnd', error);
                }
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true
  }
);
