type Props = {
  title: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
};

function Header({ title, headerLeft, headerRight }: Props) {
  return (
    <div className=" bg-white px-4 py-2 border-b border-gray-200 dark:bg-surface-01dp dark:border-white/10">
      <div className="relative flex justify-center items-center container max-w-screen-lg mx-auto">
        <div className="absolute left-0">{headerLeft}</div>
        <h1 className="text-lg font-medium dark:text-white">{title}</h1>
        <div className="absolute right-0">{headerRight}</div>
      </div>
    </div>
  );
}

export default Header;
