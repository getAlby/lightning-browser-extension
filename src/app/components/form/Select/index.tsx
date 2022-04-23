type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
};

function Select({ children, value, name, onChange }: Props) {
  return (
    <select
      className="w-full border-gray-300 rounded-md shadow-sm text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-500"
      name={name}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  );
}

export default Select;
