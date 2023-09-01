type Props = {
  title: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
};

function Header({ title, headerLeft, headerRight }: Props) {
  return (
    <div className="bg-white py-2 border-b border-gray-200 dark:bg-surface-01dp dark:border-neutral-700">
      <div className="flex justify-between items-center container max-w-screen-lg px-4 mx-auto">
        <div className="w-8 h-8">{headerLeft}</div>
        <h1 className="text-lg font-medium dark:text-white">{title}</h1>
        <div className="w-8 h-8">{headerRight}</div>
      </div>
    </div>
  );
}

export default Header;
