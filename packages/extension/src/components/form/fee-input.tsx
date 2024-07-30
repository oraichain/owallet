import React, { FunctionComponent, useState } from "react";
import { FormGroup, Label } from "reactstrap";
import {
  FeeConfig,
  GasConfig,
  InsufficientFeeError,
  NotLoadedFeeError,
} from "@owallet/hooks";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Input } from "./input";

export interface GasInputProps {
  feeConfig: FeeConfig;
  gasConfig: GasConfig;

  label?: string;
  className?: string;
  defaultValue?: number;

  classNameInputGroup?: string | unknown | any;
  classNameInput?: string | unknown | any;
}

// TODO: Handle the max block gas limit(?)
export const FeeInput: FunctionComponent<GasInputProps> = observer(
  ({ feeConfig, label, className, classNameInputGroup, classNameInput }) => {
    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });
    const intl = useIntl();

    const error = feeConfig.getError();
    const errorText: string | undefined = (() => {
      if (error) {
        switch (error.constructor) {
          case InsufficientFeeError:
            return intl.formatMessage({
              id: "input.fee.error.insufficient",
            });
          case NotLoadedFeeError:
            return undefined;
          default:
            return (
              error.message ||
              intl.formatMessage({ id: "input.fee.error.unknown" })
            );
        }
      }
    })();
    return (
      <FormGroup className={className}>
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}
        <Input
          styleInputGroup={{
            borderWidth: 0,
            padding: 0,
            margin: 0,
          }}
          placeHolder={"Enter fee in TRX"}
          className={classNameInput}
          defaultValue={feeConfig.fee
            ?.shrink(true)
            ?.trim(true)
            ?.hideDenom(true)
            ?.toString()}
          error={errorText}
          id={inputId}
          rightIcon={
            <span
              style={{
                padding: 10,
                color: "#777e90",
                textTransform: "uppercase",
              }}
            >
              {feeConfig.feeCurrency.coinDenom}
            </span>
          }
        />
      </FormGroup>
    );
  }
);
