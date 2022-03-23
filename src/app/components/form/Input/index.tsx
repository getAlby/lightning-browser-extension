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
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      name={name}
      id={id}
      className="shadow-sm focus:ring-orange-bitcoin focus:border-orange-bitcoin block w-full sm:text-sm border-gray-300 rounded-md placeholder-gray-400 dark:bg-gray-200 dark:placeholder-gray-600 dark:text-black"
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
}
