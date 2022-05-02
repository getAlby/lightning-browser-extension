type Props = {
  title: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
};

function Header({ title, headerLeft, headerRight }: Props) {
  return (
    <div className="relative flex justify-center items-center bg-white px-4 py-2 border-b border-gray-200 dark:bg-surface-01dp dark:border-white/10">
      <div className="absolute left-4">{headerLeft}</div>
      <h1 className="text-lg font-medium dark:text-white">{title}</h1>
      <div className="absolute right-4">{headerRight}</div>
    </div>
  );
}

export default Header;
