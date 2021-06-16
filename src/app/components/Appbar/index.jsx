import React from "react";
import Skeleton from "react-loading-skeleton";
import WalletIcon from "@bitcoin-design/bitcoin-icons/svg/outline/wallet.svg";
import GearIcon from "@bitcoin-design/bitcoin-icons/svg/outline/gear.svg";

export default function Appbar({ title, subtitle, onOptionsClick }) {
  return (
    <div className="px-5 space-x-4 py-2 flex items-center border-b border-gray-100">
      <img
        className="w-7 h-7 opacity-50"
        src={WalletIcon}
        alt=""
        aria-hidden="true"
      />
      <div className="flex-auto">
        <div className="text-xs text-gray-500">{title || <Skeleton />}</div>
        <div className="text-xs">{subtitle || <Skeleton />}</div>
      </div>
      <button
        className="ml-auto focus:outline-none transition duration-200 opacity-50 hover:opacity-100"
        onClick={onOptionsClick}
      >
        <img className="w-7 h-7" src={GearIcon} alt="" aria-hidden="true" />
      </button>
    </div>
  );
}
