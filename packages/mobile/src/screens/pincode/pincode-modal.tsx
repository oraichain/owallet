import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Pincode } from "@src/components/pincode/pincode-component";
import { ScrollView } from "react-native-gesture-handler";
import { metrics } from "@src/themes";

export const PincodeModal: FunctionComponent<{
  onVerifyPincode: Function;
  onGoBack: Function;
  label?: string;
  subLabel?: string;
}> = observer(({ onVerifyPincode, onGoBack, label, subLabel }) => {
  return (
    <ScrollView contentContainerStyle={{ height: "99%" }}>
      <Pincode
        onVerifyPincode={onVerifyPincode}
        subLabel={subLabel}
        label={label}
        needConfirmation={false}
        onGoBack={onGoBack}
      />
    </ScrollView>
  );
});
