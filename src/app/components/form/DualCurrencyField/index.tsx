import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils";
import { RangeLabel } from "./rangeLabel";

export type DualCurrencyFieldChangeEventTarget = HTMLInputElement & {
  valueInFiat: number; // current value converted to fiat
  formattedValueInFiat: string; // current value in fiat formatted (e.g. $10.00)
  valueInSats: number; // current value in sats
  formattedValueInSats: string; // current value in sats formatted (e.g. 1000 sats)
};

export type DualCurrencyFieldChangeEvent =
  React.ChangeEvent<HTMLInputElement> & {
    target: DualCurrencyFieldChangeEventTarget;
  };

export type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
  label: string;
  hint?: string;
  amountExceeded?: boolean;
  rangeExceeded?: boolean;
  showFiat?: boolean; // compute and show fiat value
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

  // Perform currency conversions for the input value
  // always returns formatted and raw values in sats and fiat
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
        valueInFiat = Math.round(valueInSats * rate * 10000) / 10000.0;
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

  // Use fiat as main currency for the input
  const setUseFiatAsMain = useCallback(
    async (useFiatAsMain: boolean, recalculateValue: boolean = true) => {
      if (!showFiat) useFiatAsMain = false;
      const userCurrency = settings?.currency || "BTC";
      const rate = await getCurrencyRate();

      if (min) {
        setMinValue(
          useFiatAsMain
            ? (Math.round(Number(min) * rate * 10000) / 10000.0).toString()
            : min
        );
      }

      if (max) {
        setMaxValue(
          useFiatAsMain
            ? (Math.round(Number(max) * rate * 10000) / 10000.0).toString()
            : max
        );
      }

      _setUseFiatAsMain(useFiatAsMain);
      if (recalculateValue) {
        const newValue = useFiatAsMain
          ? Math.round(Number(inputValue) * rate * 10000) / 10000.0
          : Math.round(Number(inputValue) / rate);
        setInputValue(newValue);
      }
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

  // helper to swap currencies (btc->fiat fiat->btc)
  const swapCurrencies = () => {
    setUseFiatAsMain(!useFiatAsMain);
  };

  // This wraps the onChange event and converts input values
  const onChangeWrapper = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);

      if (onChange) {
        const wrappedEvent: DualCurrencyFieldChangeEvent =
          e as DualCurrencyFieldChangeEvent;

        // Convert and inject the converted values into the event
        const value = Number(e.target.value);
        const { valueInSats, formattedSats, valueInFiat, formattedFiat } =
          await convertValues(value, useFiatAsMain);

        // we need to clone the target to avoid side effects on react internals
        wrappedEvent.target =
          e.target.cloneNode() as DualCurrencyFieldChangeEventTarget;
        // ensure the value field is always in sats, this allows the code using this component
        // to "reason in sats" and not have to worry about the user's currency
        wrappedEvent.target.value = valueInSats.toString();
        wrappedEvent.target.valueInFiat = valueInFiat;
        wrappedEvent.target.formattedValueInFiat = formattedFiat;
        wrappedEvent.target.valueInSats = valueInSats;
        wrappedEvent.target.formattedValueInSats = formattedSats;
        // Call the original onChange callback
        onChange(wrappedEvent);
      }
    },
    [onChange, useFiatAsMain, convertValues]
  );

  // default to fiat when account currency is set to anything other than BTC
  useEffect(() => {
    if (!initialized.current) {
      const initializeFiatMain = !!(
        account?.currency && account?.currency !== "BTC"
      );
      setUseFiatAsMain(initializeFiatMain, initializeFiatMain);
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
      step={useFiatAsMain ? "0.0001" : "1"}
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
          <p
            className="helper text-gray-500 z-1 pr-2 hover:text-gray-600 dark:hover:text-neutral-400 cursor-pointer"
            onClick={swapCurrencies}
          >
            {inputPrefix}
          </p>
        )}

        {inputNode}

        {!!altFormattedValue && (
          <p
            className="helper whitespace-nowrap text-gray-500 z-1 hover:text-gray-600 dark:hover:text-neutral-400 cursor-pointer"
            onClick={swapCurrencies}
          >
            {!useFiatAsMain && "~"}
            {altFormattedValue}
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
