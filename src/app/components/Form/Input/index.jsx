import React from "react";

export default function Input({
  name,
  id,
  placeholder,
  type = "text",
  required = false,
  onChange,
  value,
  autoFocus = false,
  autoComplete = "off",
  disabled,
  min,
  max,
}) {
  return (
    <input
      type={type}
      name={name}
      id={id}
      className="shadow-sm focus:ring-orange-bitcoin h-14 focus:border-orange-bitcoin block w-full sm:text-sm border-gray-300 rounded-md"
      placeholder={placeholder}
      required={required}
      onChange={onChange}
      value={value}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      disabled={disabled}
      min={min}
      max={max}
    />
  );
}
