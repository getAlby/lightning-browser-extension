import React from "react";
import Skeleton from "react-loading-skeleton";
import WalletIcon from "@bitcoin-design/bitcoin-icons/svg/outline/wallet.svg";
import GearIcon from "@bitcoin-design/bitcoin-icons/svg/outline/gear.svg";

type Props = {
  title: string;
  subtitle: string;
  onOptionsClick: () => void;
  children?: React.ReactNode;
};

export default function Navbar({
  title,
  subtitle,
  onOptionsClick,
  children,
}: Props) {
  return (
    <div className="px-5 py-2 flex justify-between items-center border-b border-gray-200">
      <div className="w-8/12 md:w-4/12 lg:w-3/12 flex items-center">
        <img
          className="-ml-1 mr-4 w-8 h-8 opacity-50"
          src={WalletIcon}
          alt=""
          aria-hidden="true"
        />
        <div className="flex-auto">
          <div className="text-sm text-gray-500">{title || <Skeleton />}</div>
          <div className="text-sm">{subtitle || <Skeleton />}</div>
        </div>
      </div>
      {children && (
        <div>
          <nav className="flex space-x-8">{children}</nav>
        </div>
      )}
      <div className="md:w-4/12 lg:w-3/12 flex justify-end items-center">
        {onOptionsClick && (
          <button
            className="opacity-50 focus:outline-none transition-opacity duration-200 hover:opacity-100"
            onClick={onOptionsClick}
          >
            <img
              className="-mr-1 w-8 h-8"
              src={GearIcon}
              alt=""
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
}
