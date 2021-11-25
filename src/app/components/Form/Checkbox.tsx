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
      className="h-4 w-4 text-orange-bitcoin focus:ring-orange-bitcoin border-gray-300 rounded"
    />
  );
}

export default Checkbox;
