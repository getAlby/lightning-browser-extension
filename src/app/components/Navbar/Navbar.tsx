import Skeleton from "react-loading-skeleton";
import WalletIcon from "@bitcoin-design/bitcoin-icons/svg/outline/wallet.svg";

import UserMenu from "../UserMenu";
import AccountMenu from "../AccountMenu";

type Props = {
  title: string;
  subtitle: string;
  onAccountSwitch?: () => void;
  children?: React.ReactNode;
};

export default function Navbar({
  title,
  subtitle,
  onAccountSwitch,
  children,
}: Props) {
  return (
    <div className="px-4 py-2 bg-white flex justify-between items-center border-b border-gray-200">
      <div className="flex w-8/12 md:w-4/12 lg:w-3/12">
        <div className="relative pl-2 flex bg-gray-100 rounded-md">
          <div className="flex items-center">
            <img
              className="-ml-1 w-8 h-8 opacity-50"
              src={WalletIcon}
              alt=""
              aria-hidden="true"
            />
          </div>
          <div
            className={`flex-auto mx-2 py-1 ${
              !title && !subtitle ? "w-28" : ""
            }`}
          >
            <div className="text-xs text-gray-500">{title || <Skeleton />}</div>
            <div className="text-xs">{subtitle || <Skeleton />}</div>
          </div>
          <AccountMenu onAccountSwitch={onAccountSwitch} />
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
