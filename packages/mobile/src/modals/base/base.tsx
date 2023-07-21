import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';
import { Keyboard, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStyle } from '../../styles';

import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  useBottomSheetDynamicSnapPoints
} from '@gorhom/bottom-sheet';

export interface ModalBaseProps {
  align?: 'top' | 'center' | 'bottom';
  isOpen: boolean;
  onOpenTransitionEnd?: () => void;
  onCloseTransitionEnd?: () => void;
  containerStyle?: ViewStyle;
  disableSafeArea?: boolean;
}

export const ModalBase: FunctionComponent<ModalBaseProps> = ({
  children,
  align = 'bottom',
  isOpen,
  onOpenTransitionEnd,
  onCloseTransitionEnd,
  containerStyle,
  disableSafeArea
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  // const snapPoints = useMemo(() => ['35%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (openTransitionRef.current && index > 0) {
      openTransitionRef.current();
    }
  }, []);

  const style = useStyle();

  const openTransitionRef = useRef(onOpenTransitionEnd);
  openTransitionRef.current = onOpenTransitionEnd;
  const closeTransitionRef = useRef(onCloseTransitionEnd);
  closeTransitionRef.current = onCloseTransitionEnd;

  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current.present();
    } else {
      bottomSheetModalRef.current.close();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={'close'}
      />
    ),
    []
  );
  const handleDismiss = useCallback(() => {
    Keyboard.dismiss();
    if (closeTransitionRef.current) {
      closeTransitionRef.current();
    }
  }, []);
  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);
  return (
    <View
      style={style.flatten(['absolute-fill', 'overflow-visible'])}
      pointerEvents="box-none"
    >
      {!disableSafeArea ? (
        <SafeAreaView
          style={style.flatten(
            ['flex-1', 'overflow-visible'],
            [
              align === 'center' && 'justify-center',
              align === 'top' && 'justify-start',
              align === 'bottom' && 'justify-end'
            ]
          )}
          pointerEvents="box-none"
        >
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            backdropComponent={renderBackdrop}
            onChange={handleSheetChanges}
            keyboardBlurBehavior={'restore'}
            onDismiss={handleDismiss}
          >
            <BottomSheetView
              style={containerStyle}
              onLayout={handleContentLayout}
            >
              {children}
            </BottomSheetView>
          </BottomSheetModal>
        </SafeAreaView>
      ) : (
        <View
          style={style.flatten(
            ['flex-1', 'overflow-visible'],
            [
              align === 'center' && 'justify-center',
              align === 'top' && 'justify-start',
              align === 'bottom' && 'justify-end'
            ]
          )}
          pointerEvents="box-none"
        >
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            backdropComponent={renderBackdrop}
            onChange={handleSheetChanges}
            keyboardBlurBehavior={'restore'}
            onDismiss={handleDismiss}
          >
            <BottomSheetView
              style={containerStyle}
              onLayout={handleContentLayout}
            >
              {children}
            </BottomSheetView>
          </BottomSheetModal>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey'
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center'
  }
});
