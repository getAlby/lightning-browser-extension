import React from "react";
import Skeleton from "react-loading-skeleton";
import WalletIcon from "@bitcoin-design/bitcoin-icons/svg/outline/wallet.svg";
import GearIcon from "@bitcoin-design/bitcoin-icons/svg/outline/gear.svg";

export default function Appbar({ title, subtitle, onOptionsClick, children }) {
  return (
    <div className="px-5 py-2 flex justify-between items-center border-b border-gray-200">
      <div className="w-4/12 lg:w-3/12 flex items-center">
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
      <div>{children}</div>
      <div className="w-4/12 lg:w-3/12 flex justify-end items-center">
        <button
          className="focus:outline-none transition duration-200 opacity-50 hover:opacity-100"
          onClick={onOptionsClick}
        >
          <img
            className="-mr-1 w-8 h-8"
            src={GearIcon}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}
