import AccountMenu from "../AccountMenu";
import UserMenu from "../UserMenu";

type Props = {
  children?: React.ReactNode;
};

export default function Navbar({ children }: Props) {
  return (
    <div className="px-4 py-2 bg-white border-b border-gray-200 dark:bg-surface-01dp dark:border-white/10">
      <div className="max-w-screen-lg flex justify-between mx-auto w-full lg:px-4 items-center">
        <div className="flex">
          <AccountMenu />
        </div>

        {children && <nav className="flex space-x-8 lg:-ml-2">{children}</nav>}

        <div className="flex justify-end items-center">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
