import Input from "../Input";

export type Props = {
  label: string;
  hint?: string;
  suffix?: string;
  endAdornment?: React.ReactNode;
};

const TextField = ({
  autoComplete = "off",
  autoFocus = false,
  disabled,
  endAdornment,
  hint,
  id,
  label,
  max,
  maxLength,
  min,
  minLength,
  onBlur,
  onChange,
  onFocus,
  pattern,
  placeholder,
  required = false,
  suffix,
  title,
  type = "text",
  value,
}: React.InputHTMLAttributes<HTMLInputElement> & Props) => (
  <>
    <label htmlFor={id} className="font-medium text-gray-800 dark:text-white">
      {label}
    </label>

    <div className="mt-1">
      <Input
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        endAdornment={endAdornment}
        id={id}
        max={max}
        maxLength={maxLength}
        min={min}
        minLength={minLength}
        name={id}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        pattern={pattern}
        placeholder={placeholder}
        required={required}
        suffix={suffix}
        title={title}
        type={type}
        value={value}
      />

      {hint && (
        <p className="my-1 text-xs text-gray-700 dark:text-neutral-400">
          {hint}
        </p>
      )}
    </div>
  </>
);

export default TextField;
