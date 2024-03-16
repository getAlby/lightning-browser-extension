import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils";
import { RangeLabel } from "./rangeLabel";

export type DualCurrencyFieldChangeEvent =
  React.ChangeEvent<HTMLInputElement> & {
    target: HTMLInputElement & {
      valueInFiat: number;
      formattedValueInFiat: string;
      valueInSats: number;
      formattedValueInSats: string;
    };
  };

export type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
  label: string;
  hint?: string;
  amountExceeded?: boolean;
  rangeExceeded?: boolean;
  baseToAltRate?: number;
  showFiat?: boolean;
  onChange?: (e: DualCurrencyFieldChangeEvent) => void;
};

export default function DualCurrencyField({
  label,
  showFiat = true,
  id,
  placeholder,
  required = false,
  pattern,
  title,
  onChange,
  onFocus,
  onBlur,
  value,
  autoFocus = false,
  autoComplete = "off",
  disabled,
  min,
  max,
  suffix,
  endAdornment,
  hint,
  amountExceeded,
  rangeExceeded,
}: React.InputHTMLAttributes<HTMLInputElement> & Props) {
  const { t: tCommon } = useTranslation("common");
  const { getFormattedInCurrency, getCurrencyRate, settings } = useSettings();
  const { account } = useAccount();

  const inputEl = useRef<HTMLInputElement>(null);
  const outerStyles =
    "rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";

  const initialized = useRef(false);
  const [useFiatAsMain, _setUseFiatAsMain] = useState(false);
  const [altFormattedValue, setAltFormattedValue] = useState("");
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);
  const [inputValue, setInputValue] = useState(value || 0);

  const getValues = useCallback(
    async (value: number, useFiatAsMain: boolean) => {
      let valueInSats = Number(value);
      let valueInFiat = 0;

      if (showFiat) {
        valueInFiat = Number(value);
        const rate = await getCurrencyRate();
        if (useFiatAsMain) {
          valueInSats = Math.round(valueInSats / rate);
        } else {
          valueInFiat = Math.round(valueInFiat * rate * 100) / 100.0;
        }
      }

      const formattedSats = getFormattedInCurrency(valueInSats, "BTC");
      let formattedFiat = "";

      if (showFiat && valueInFiat) {
        formattedFiat = getFormattedInCurrency(valueInFiat, settings.currency);
      }

      return {
        valueInSats,
        formattedSats,
        valueInFiat,
        formattedFiat,
      };
    },
    [getCurrencyRate, getFormattedInCurrency, showFiat, settings.currency]
  );

  useEffect(() => {
    (async () => {
      if (showFiat) {
        const { formattedSats, formattedFiat } = await getValues(
          Number(inputValue),
          useFiatAsMain
        );
        setAltFormattedValue(useFiatAsMain ? formattedSats : formattedFiat);
      }
    })();
  }, [useFiatAsMain, inputValue, getValues, showFiat]);

  const setUseFiatAsMain = useCallback(
    async (v: boolean) => {
      if (!showFiat) v = false;

      const rate = showFiat ? await getCurrencyRate() : 1;
      if (min) {
        let minV;
        if (v) {
          minV = (Math.round(Number(min) * rate * 100) / 100.0).toString();
        } else {
          minV = min;
        }

        setMinValue(minV);
      }
      if (max) {
        let maxV;
        if (v) {
          maxV = (Math.round(Number(max) * rate * 100) / 100.0).toString();
        } else {
          maxV = max;
        }

        setMaxValue(maxV);
      }

      let newValue;
      if (v) {
        newValue = Math.round(Number(inputValue) * rate * 100) / 100.0;
      } else {
        newValue = Math.round(Number(inputValue) / rate);
      }

      _setUseFiatAsMain(v);
      setInputValue(newValue);
    },
    [showFiat, getCurrencyRate, inputValue, min, max]
  );

  const swapCurrencies = () => {
    setUseFiatAsMain(!useFiatAsMain);
  };

  const onChangeWrapper = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);

      if (onChange) {
        const value = Number(e.target.value);
        const { valueInSats, formattedSats, valueInFiat, formattedFiat } =
          await getValues(value, useFiatAsMain);
        const newEvent: DualCurrencyFieldChangeEvent = {
          ...e,
          target: {
            ...e.target,
            value: valueInSats.toString(),
            valueInFiat,
            formattedValueInFiat: formattedFiat,
            valueInSats,
            formattedValueInSats: formattedSats,
          },
        };
        onChange(newEvent);
      }
    },
    [onChange, useFiatAsMain, getValues]
  );

  // default to fiat when account currency is set to anything other than BTC
  useEffect(() => {
    if (!initialized.current) {
      setUseFiatAsMain(!!(account?.currency && account?.currency !== "BTC"));
      initialized.current = true;
    }
  }, [account?.currency, setUseFiatAsMain]);

  const inputNode = (
    <input
      ref={inputEl}
      type="number"
      name={id}
      id={id}
      className={classNames(
        "dual-currency-field",
        "block w-full placeholder-gray-500 dark:placeholder-gray-600 dark:text-white ",
        "px-0 border-0 focus:ring-0 bg-transparent"
      )}
      placeholder={placeholder}
      required={required}
      pattern={pattern}
      title={title}
      onChange={onChangeWrapper}
      onFocus={onFocus}
      onBlur={onBlur}
      value={inputValue}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      disabled={disabled}
      min={minValue}
      max={maxValue}
      step={useFiatAsMain ? "0.01" : "1"}
    />
  );

  // run effect on input mount to ignore wheel/scroll event
  useEffect(() => {
    const ignoreScroll = (evt: globalThis.WheelEvent) => {
      evt.preventDefault();
    };
    const elem = inputEl.current;
    elem && elem.addEventListener("wheel", ignoreScroll);
    return () => {
      elem && elem.removeEventListener("wheel", ignoreScroll);
    };
  }, [inputEl]);

  return (
    <div className="relative block m-0">
      <div className="flex justify-between items-center w-full">
        <label
          htmlFor={id}
          className="font-medium text-gray-800 dark:text-white"
        >
          {label}
        </label>
        {(minValue || maxValue) && (
          <span
            className={classNames(
              "text-xs text-gray-700 dark:text-neutral-400",
              !!rangeExceeded && "text-red-500 dark:text-red-500"
            )}
          >
            <RangeLabel min={minValue} max={maxValue} />{" "}
            {useFiatAsMain ? "" : tCommon("sats_other")}
          </span>
        )}
      </div>

      <div
        className={classNames(
          "flex items-center overflow-hidden field mt-1 px-3",
          "focus-within:ring-primary focus-within:border-primary focus-within:dark:border-primary focus-within:ring-1",
          !hint && "mb-2",
          (!!amountExceeded || !!rangeExceeded) &&
            "border-red-500 dark:border-red-500",
          outerStyles
        )}
      >
        {inputNode}

        {!!altFormattedValue && (
          <p className="helper text-gray-500 z-1" onClick={swapCurrencies}>
            ~{altFormattedValue}
          </p>
        )}

        {suffix && (
          <span
            className="flex items-center px-3 font-medium bg-white dark:bg-surface-00dp dark:text-white"
            onClick={() => {
              inputEl.current?.focus();
            }}
          >
            {suffix}
          </span>
        )}

        {endAdornment && (
          <span className="flex items-center bg-white dark:bg-black dark:text-neutral-400">
            {endAdornment}
          </span>
        )}
      </div>
      {hint && (
        <p
          className={classNames(
            "my-1 text-xs text-gray-700 dark:text-neutral-400",
            !!amountExceeded && "text-red-500 dark:text-red-500"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
