import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { classNames } from "~/app/utils";

import { RangeLabel } from "./rangeLabel";

export type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
  fiatValue: string;
  label: string;
  hint?: string;
  amountExceeded?: boolean;
  rangeExceeded?: boolean;
};

export default function DualCurrencyField({
  label,
  fiatValue,
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
  const inputEl = useRef<HTMLInputElement>(null);
  const outerStyles =
    "rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";

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
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      value={value}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      disabled={disabled}
      min={min}
      max={max}
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
        {(min || max) && (
          <span
            className={classNames(
              "text-xs text-gray-700 dark:text-neutral-400",
              !!rangeExceeded && "text-red-500 dark:text-red-500"
            )}
          >
            <RangeLabel min={min} max={max} /> {tCommon("sats_other")}
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

        {!!fiatValue && (
          <p className="helper text-gray-500 z-1 pointer-events-none">
            ~{fiatValue}
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
