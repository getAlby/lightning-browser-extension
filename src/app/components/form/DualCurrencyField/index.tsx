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
  const {
    getFormattedInCurrency,
    getCurrencyRate,
    getCurrencySymbol,
    settings,
  } = useSettings();
  const { account } = useAccount();

  const inputEl = useRef<HTMLInputElement>(null);
  const outerStyles =
    "rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";

  const initialized = useRef(false);
  const [useFiatAsMain, _setUseFiatAsMain] = useState(false);
  const [altFormattedValue, setAltFormattedValue] = useState("");
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);
  const [inputValue, setInputValue] = useState(value);
  const [inputPrefix, setInputPrefix] = useState("");
  const [inputPlaceHolder, setInputPlaceHolder] = useState(placeholder || "");

  const convertValues = useCallback(
    async (inputValue: number, inputInFiat: boolean) => {
      const userCurrency = settings?.currency || "BTC";
      let valueInSats = 0;
      let valueInFiat = 0;
      const rate = await getCurrencyRate();

      if (inputInFiat) {
        valueInFiat = Number(inputValue);
        valueInSats = Math.round(valueInFiat / rate);
      } else {
        valueInSats = Number(inputValue);
        valueInFiat = Math.round(valueInSats * rate * 100) / 100.0;
      }

      const formattedSats = getFormattedInCurrency(valueInSats, "BTC");
      const formattedFiat = getFormattedInCurrency(valueInFiat, userCurrency);

      return {
        valueInSats,
        formattedSats,
        valueInFiat,
        formattedFiat,
      };
    },
    [getCurrencyRate, getFormattedInCurrency, settings]
  );

  const setUseFiatAsMain = useCallback(
    async (useFiatAsMain: boolean) => {
      if (!showFiat) useFiatAsMain = false;
      const userCurrency = settings?.currency || "BTC";
      const rate = await getCurrencyRate();

      if (min) {
        setMinValue(
          useFiatAsMain
            ? (Math.round(Number(min) * rate * 100) / 100.0).toString()
            : min
        );
      }

      if (max) {
        setMaxValue(
          useFiatAsMain
            ? (Math.round(Number(max) * rate * 100) / 100.0).toString()
            : max
        );
      }

      const newValue = useFiatAsMain
        ? Math.round(Number(inputValue) * rate * 100) / 100.0
        : Math.round(Number(inputValue) / rate);

      _setUseFiatAsMain(useFiatAsMain);
      setInputValue(newValue);
      setInputPrefix(getCurrencySymbol(useFiatAsMain ? userCurrency : "BTC"));
      if (!placeholder) {
        setInputPlaceHolder(
          tCommon("amount_placeholder", {
            currency: useFiatAsMain ? userCurrency : "sats",
          })
        );
      }
    },
    [
      settings,
      showFiat,
      getCurrencyRate,
      inputValue,
      min,
      max,
      tCommon,
      getCurrencySymbol,
      placeholder,
    ]
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
          await convertValues(value, useFiatAsMain);
        const wrappedEvent: DualCurrencyFieldChangeEvent =
          e as DualCurrencyFieldChangeEvent;
        wrappedEvent.target.value = valueInSats.toString();
        wrappedEvent.target.valueInFiat = valueInFiat;
        wrappedEvent.target.formattedValueInFiat = formattedFiat;
        wrappedEvent.target.valueInSats = valueInSats;
        wrappedEvent.target.formattedValueInSats = formattedSats;
        onChange(wrappedEvent);
      }
    },
    [onChange, useFiatAsMain, convertValues]
  );

  // default to fiat when account currency is set to anything other than BTC
  useEffect(() => {
    if (!initialized.current) {
      if (account?.currency && account?.currency !== "BTC") {
        setUseFiatAsMain(true);
      }
      initialized.current = true;
    }
  }, [account?.currency, setUseFiatAsMain]);

  // update alt value
  useEffect(() => {
    (async () => {
      if (showFiat) {
        const { formattedSats, formattedFiat } = await convertValues(
          Number(inputValue || 0),
          useFiatAsMain
        );
        setAltFormattedValue(useFiatAsMain ? formattedSats : formattedFiat);
      }
    })();
  }, [useFiatAsMain, inputValue, convertValues, showFiat]);

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
      placeholder={inputPlaceHolder}
      required={required}
      pattern={pattern}
      title={title}
      onChange={onChangeWrapper}
      onFocus={onFocus}
      onBlur={onBlur}
      value={inputValue ? inputValue : ""}
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
        {!!inputPrefix && (
          <p className="helper text-gray-500 z-1 pr-2" onClick={swapCurrencies}>
            {inputPrefix}
          </p>
        )}

        {inputNode}

        {!!altFormattedValue && (
          <p
            className="helper whitespace-nowrap text-gray-500 z-1"
            onClick={swapCurrencies}
          >
            ~{altFormattedValue}
          </p>
        )}

        {suffix && (
          <span
            className="flex  items-center px-3 font-medium bg-white dark:bg-surface-00dp dark:text-white"
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
