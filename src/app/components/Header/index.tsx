type Props = {
  title: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
};

function Header({ title, headerLeft, headerRight }: Props) {
  return (
    <div className="flex justify-between bg-white px-4 py-2 border-b border-gray-200 dark:bg-gray-700 dark:border-gray-500">
      <div className="flex items-center">
        {headerLeft && <div className="mr-3">{headerLeft}</div>}
        <h1 className="text-lg font-medium dark:text-white">{title}</h1>
      </div>
      {headerRight}
    </div>
  );
}

export default Header;
