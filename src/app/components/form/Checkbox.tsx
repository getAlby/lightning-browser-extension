function Checkbox({
  id,
  name,
  checked,
  onChange,
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
    />
  );
}

export default Checkbox;
