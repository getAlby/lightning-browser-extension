import { useRef } from "react";

import { classNames } from "../../../utils";

type Props = {
  suffix?: string;
  endAdornment?: React.ReactNode;
  block?: boolean;
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
  block = true,
  className,
  ...otherProps
}: React.InputHTMLAttributes<HTMLInputElement> & Props) {
  const inputEl = useRef<HTMLInputElement>(null);
  const outerStyles =
    "rounded-md border border-gray-300 dark:border-neutral-800 transition duration-300 flex-1";

  const inputNode = (
    <input
      {...otherProps}
      ref={inputEl}
      type={type}
      name={name}
      id={id}
      className={classNames(
        "placeholder-gray-500 dark:placeholder-neutral-600",
        block && "block w-full",
        !suffix && !endAdornment
          ? `${outerStyles} focus:ring-primary focus:border-primary focus:ring-1`
          : "pr-0 border-0 focus:ring-0",
        disabled
          ? "bg-gray-50 dark:bg-surface-01dp text-gray-500 dark:text-neutral-500"
          : "bg-white dark:bg-black dark:text-white",
        !!className && className
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
        !disabled &&
          "focus-within:ring-primary focus-within:border-primary focus-within:dark:border-primary focus-within:ring-1",
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
        <span
          className={classNames(
            "flex items-center bg-white dark:bg-black dark:text-neutral-400",
            !!disabled && "bg-gray-50 dark:bg-surface-01dp"
          )}
        >
          {endAdornment}
        </span>
      )}
    </div>
  );
}
