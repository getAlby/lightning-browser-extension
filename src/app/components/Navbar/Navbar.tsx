import AccountMenu from "../AccountMenu";
import UserMenu from "../UserMenu";

type Props = {
  children?: React.ReactNode;
};

export default function Navbar({ children }: Props) {
  return (
    <div className="py-[6px] bg-white border-b border-gray-200 dark:bg-surface-01dp dark:border-neutral-700 whitespace-nowrap">
      <div className="max-w-screen-lg px-4 flex justify-between items-center mx-auto w-full">
        <div className="flex items-center">
          <UserMenu />
          {children && (
            <nav className="ml-8 space-x-8 hidden md:flex">{children}</nav>
          )}
        </div>
        <AccountMenu />
      </div>
    </div>
  );
}
