import Input from "./Input";

const TextField = ({
  id,
  label,
  placeholder,
  type = "text",
  required = false,
  onChange,
  onFocus,
  onBlur,
  value,
  autoFocus = false,
  autoComplete = "off",
  disabled,
  min,
  max,
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
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
    </div>
  </>
);

export default TextField;
