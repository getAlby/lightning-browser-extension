import Input from "./Input";

const IconTextField = ({
  id,
  label,
  placeholder,
  type = "text",
  required = false,
  pattern,
  title,
  onIconClick,
  onChange,
  onFocus,
  onBlur,
  value,
  autoFocus = false,
  autoComplete = "off",
  disabled,
  min,
  max,
  icon,
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon: React.ReactNode;
  onIconClick: () => void;
}) => {
  return (
    <>
      <label
        htmlFor={id}
        className="block font-medium text-gray-700 dark:text-white"
      >
        {label}
      </label>
      <div className="mt-1">
        <div className="relative flex">
          <Input
            type={type}
            name={id}
            id={id}
            placeholder={placeholder}
            required={required}
            pattern={pattern}
            title={title}
            className="pr-8"
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
          <div
            className="absolute flex right-0 h-full p-2 cursor-pointer"
            onClick={onIconClick}
          >
            {icon}
          </div>
        </div>
      </div>
    </>
  );
};

export default IconTextField;
