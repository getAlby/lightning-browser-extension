import { useRef } from "react";
import { classNames } from "~/app/utils";

export type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
  secondaryValue: string | number;
  label: string;
};

export default function DualCurrencyField({
  label,
  secondaryValue,
  id,
  placeholder,
  type = "text",
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
}: React.InputHTMLAttributes<HTMLInputElement> & Props) {
  const inputEl = useRef<HTMLInputElement>(null);
  const outerStyles =
    "shadow-sm rounded-md border border-gray-300 dark:border-gray-800 bg-white dark:bg-black transition duration-300";

  const inputNode = (
    <input
      ref={inputEl}
      type={type}
      name={id}
      id={id}
      className={classNames(
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

  return (
    <div id="numberInput" className="relative block m-0">
      <label
        htmlFor={id}
        className="block font-medium text-gray-800 dark:text-white"
      >
        {label}
      </label>

      <div
        className={classNames(
          "flex items-stretch overflow-hidden field mt-1 mb-6 pb-6 relative",
          "focus-within:ring-orange-bitcoin focus-within:border-orange-bitcoin focus-within:dark:border-orange-bitcoin focus-within:ring-1",
          outerStyles
        )}
      >
        {inputNode}

        <p className="helper text-xs text-gray-600 absolute z-1 top-0 left-0 font-semibold pointer-events-none translate-x-4 translate-y-10">
          ~{secondaryValue}
        </p>

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
          <span className="flex items-center bg-white dark:bg-black">
            {endAdornment}
          </span>
        )}
      </div>
    </div>
  );
}
