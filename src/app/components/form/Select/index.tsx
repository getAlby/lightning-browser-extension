type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
};

function Select({ children, value, name, onChange }: Props) {
  return (
    <select
      className="w-full border-gray-300 rounded-md shadow-sm text-gray-800 bg-white dark:bg-surface-00dp dark:text-neutral-200 dark:border-neutral-800"
      name={name}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  );
}

export default Select;
