import React from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/outline";

import Badge from "../Badge";

type Props = {
  transactions: Transaction[];
};

type Transaction = {
  type: string;
  id: string;
  title: string;
  subTitle: string;
  date: string;
  amount: string;
  currency: string;
  value: string;
  preimage: string;
};

export default function TransactionsTable({ transactions }: Props) {
  function renderIcon(type: string) {
    function getIcon() {
      const iconClasses = "h-4 w-4";
      switch (type) {
        case "received":
          return <PlusIcon className={iconClasses} aria-hidden="true" />;
        case "sent":
          return <MinusIcon className={iconClasses} aria-hidden="true" />;
        case "sending":
          return <MinusIcon className={iconClasses} aria-hidden="true" />;
      }
    }

    return (
      <div className="flex justify-center items-center w-7 h-7 border-2 border-gray-200 rounded-full">
        {getIcon()}
      </div>
    );
  }

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 rounded-lg">
      <div className="bg-white divide-y divide-gray-200">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex justify-between space-x-5 px-3 py-2">
            <div className="overflow-hidden">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  {tx.type && renderIcon(tx.type)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-gray-900 truncate">{tx.title}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {tx.subTitle}
                    <p className="truncate">{tx.preimage}</p>
                  </div>
                </div>
              </div>
              {tx.badges && (
                <div className="ml-6 space-x-3">
                  {tx.badges.map((badge) => (
                    <Badge
                      label={badge.label}
                      color={badge.color}
                      textColor={badge.textColor}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p>{tx.totalAmount} sats</p>
              <p className="text-sm text-gray-500">{tx.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
