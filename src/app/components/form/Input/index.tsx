import { useRef } from "react";

import { classNames } from "../../../utils";

type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
};

export default function Input({
  name,
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
    "rounded-md border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black transition duration-300";

  const inputNode = (
    <input
      ref={inputEl}
      type={type}
      name={name}
      id={id}
      className={classNames(
        "block w-full placeholder-gray-500 dark:placeholder-neutral-600 dark:text-white",
        !suffix && !endAdornment
          ? `${outerStyles} focus:ring-orange-bitcoin focus:border-orange-bitcoin focus:dark:border-orange-bitcoin focus:ring-1`
          : "pr-0 border-0 focus:ring-0 bg-transparent"
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

  if (!suffix && !endAdornment) return inputNode;

  return (
    <div
      className={classNames(
        "flex items-stretch overflow-hidden",
        "focus-within:ring-orange-bitcoin focus-within:border-orange-bitcoin focus-within:dark:border-orange-bitcoin focus-within:ring-1",
        outerStyles
      )}
    >
      {inputNode}
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
  );
}
