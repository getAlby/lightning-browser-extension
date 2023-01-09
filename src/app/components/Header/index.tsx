type Props = {
  title: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
};

function Header({ title, headerLeft, headerRight }: Props) {
  return (
    <div className="bg-white py-2 border-b border-gray-200 dark:bg-surface-01dp dark:border-white/10">
      <div className="max-w-screen-lg px-4 mx-auto relative flex justify-center items-center">
        <div className="absolute left-4">{headerLeft}</div>
        <h1 className="text-lg font-medium dark:text-white">{title}</h1>
        <div className="absolute right-4">{headerRight}</div>
      </div>
    </div>
  );
}

export default Header;
