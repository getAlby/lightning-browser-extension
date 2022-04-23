import Input from "./Input";

type Props = {
  label: string;
  suffix?: string;
};

const TextField = ({
  id,
  label,
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
  minLength,
  maxLength,
  min,
  max,
  suffix,
}: React.InputHTMLAttributes<HTMLInputElement> & Props) => (
  <>
    <label
      htmlFor={id}
      className="block font-medium text-gray-700 dark:text-white"
    >
      {label}
    </label>
    <div className="mt-1">
      <Input
        type={type}
        name={id}
        id={id}
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
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        max={max}
        suffix={suffix}
      />
    </div>
  </>
);

export default TextField;
