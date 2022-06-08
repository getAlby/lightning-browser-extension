import AccountMenu from "../AccountMenu";
import UserMenu from "../UserMenu";

type Props = {
  title: string;
  balances: { satsBalance: string; fiatBalance: string };
  children?: React.ReactNode;
};

export default function Navbar({ title, balances, children }: Props) {
  return (
    <div className="px-4 py-2 bg-white flex justify-between items-center border-b border-gray-200 dark:bg-surface-01dp dark:border-white/10">
      <div className="flex w-8/12 md:w-4/12 lg:w-3/12">
        <AccountMenu title={title} balances={balances} />
      </div>
      {children && (
        <div>
          <nav className="flex space-x-8">{children}</nav>
        </div>
      )}
      <div className="md:w-4/12 lg:w-3/12 flex justify-end items-center">
        <UserMenu />
      </div>
    </div>
  );
}
