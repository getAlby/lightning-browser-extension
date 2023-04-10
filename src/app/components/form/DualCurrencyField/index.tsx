import { useEffect, useRef } from "react";
import { classNames } from "~/app/utils";

import { RangeLabel } from "./rangeLabel";

export type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
  fiatValue: string;
  label: string;
  hint?: string;
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
}: React.InputHTMLAttributes<HTMLInputElement> & Props) {
  const inputEl = useRef<HTMLInputElement>(null);
  const outerStyles =
    "shadow-sm rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";

  const inputNode = (
    <input
      ref={inputEl}
      type="number"
      name={id}
      id={id}
      className={classNames(
        "dual-currency-field",
        "block w-full placeholder-gray-500 dark:placeholder-gray-600 dark:text-white ",
        "pr-0 border-0 focus:ring-0 bg-transparent"
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
          <span className="text-xs font-normal text-gray-700 dark:text-neutral-400">
            <RangeLabel min={min} max={max} /> sats
          </span>
        )}
      </div>

      <div
        className={classNames(
          `flex items-stretch overflow-hidden field mt-1 ${!hint && "mb-2"} ${
            fiatValue && "pb-6"
          } relative`,
          "focus-within:ring-primary focus-within:border-primary focus-within:dark:border-primary focus-within:ring-1",
          outerStyles
        )}
      >
        {inputNode}

        {!!fiatValue && (
          <p className="helper text-xs text-gray-600 absolute z-1 top-0 left-0 font-semibold pointer-events-none translate-x-4 translate-y-10">
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
        <p className="my-1 text-xs text-gray-700 dark:text-neutral-400">
          {hint}
        </p>
      )}
    </div>
  );
}
