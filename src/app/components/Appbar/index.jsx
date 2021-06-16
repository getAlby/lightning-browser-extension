import React from "react";
import { CashIcon, CogIcon } from "@heroicons/react/outline";
import Skeleton from "react-loading-skeleton";

export default function Appbar({ title, subtitle, onOptionsClick }) {
  return (
    <div className="px-5 space-x-4 py-2 flex items-center border-b border-gray-100">
      <CashIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
      <div className="flex-auto">
        <div className="text-xs text-gray-500">{title || <Skeleton />}</div>
        <div className="text-xs">{subtitle || <Skeleton />}</div>
      </div>
      <button className="ml-auto" onClick={onOptionsClick}>
        <CogIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
      </button>
    </div>
  );
}
