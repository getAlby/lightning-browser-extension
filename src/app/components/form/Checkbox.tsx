function Checkbox({
  id,
  name,
  checked,
  onChange,
  disabled,
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
    />
  );
}

export default Checkbox;
