import { useState } from "react";
import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import IconTextField from "../IconTextField";

export default function PasswordInput({
  label,
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
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <IconTextField
      type={showPassword ? "text" : "password"}
      id={id}
      label={label}
      placeholder={placeholder}
      required={required}
      pattern={pattern}
      title={title}
      onIconClick={() => setShowPassword(!showPassword)}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      value={value}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      disabled={disabled}
      min={min}
      max={max}
      icon={showPassword ? <VisibleIcon /> : <HiddenIcon />}
    />
  );
}
