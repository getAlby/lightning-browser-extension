import React from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/outline";

import Badge from "../Shared/badge";

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
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {tx.type && renderIcon(tx.type)}
                  </div>
                  <div>
                    <div className="text-gray-900">{tx.title}</div>
                    <div className="text-sm text-gray-500">{tx.subTitle}</div>
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
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-right">
                <p>{tx.totalAmount} sats</p>
                <p className="text-sm text-gray-500">{tx.date}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
