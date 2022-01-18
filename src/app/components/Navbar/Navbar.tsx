import Skeleton from "react-loading-skeleton";
import { WalletIcon } from "@bitcoin-design/bitcoin-icons-react/outline";

import UserMenu from "../UserMenu";
import AccountMenu from "../AccountMenu";

type Props = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export default function Navbar({ title, subtitle, children }: Props) {
  return (
    <div className="px-4 py-2 bg-white flex justify-between items-center border-b border-gray-200 dark:bg-gray-800 dark:border-gray-500">
      <div className="flex w-8/12 md:w-4/12 lg:w-3/12">
        <div className="relative pl-2 flex bg-gray-100 rounded-md dark:bg-gray-600">
          <div className="flex items-center">
            <WalletIcon className="-ml-1 w-8 h-8 opacity-50 dark:text-white" />
          </div>
          <div
            className={`flex-auto mx-2 py-1 ${
              !title && !subtitle ? "w-28" : ""
            }`}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {title || <Skeleton />}
            </div>
            <div className="text-xs dark:text-white">
              {subtitle || <Skeleton />}
            </div>
          </div>
          <AccountMenu />
        </div>
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
