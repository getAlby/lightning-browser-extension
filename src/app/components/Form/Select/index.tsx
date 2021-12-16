type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
};

function Select({ children, value, name, onChange }: Props) {
  return (
    <select
      className="w-full h-14 border-gray-300 rounded-md shadow-sm text-gray-700 bg-white"
      name={name}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  );
}

export default Select;
