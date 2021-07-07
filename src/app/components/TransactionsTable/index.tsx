import React from "react";
import {
  PlusIcon,
  MinusIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

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
  return (
    <div className="shadow overflow-hidden border-b border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    {tx.type == "received" ? (
                      <div className="flex justify-center items-center w-8 h-8 border-2 border-gray-200 rounded-full">
                        <PlusIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    ) : (
                      ""
                    )}
                    {tx.type == "sent" ? (
                      <div className="flex justify-center items-center w-8 h-8 border-2 border-gray-200 rounded-full">
                        <MinusIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    ) : (
                      ""
                    )}
                    {tx.type == "sending" ? (
                      <div className="flex justify-center items-center w-8 h-8 border-2 border-gray-200 rounded-full">
                        <MinusIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    ) : (
                      ""
                    )}
                    {tx.error ? (
                      <ExclamationCircleIcon
                        className="h-5 w-5 border-gray-200 text-red-600"
                        text-black
                        aria-hidden="true"
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                    <div className="text-lg text-gray-900">
                      <p className="inline mr-10">{tx.title}</p>
                    </div>
                    <div className="text-sm text-gray-500">{tx.subTitle}</div>
                    <div className="text-sm text-red-600">{tx.error}</div>
                  </div>
                </div>
                {tx.badges ? (
                  <div className="ml-6 space-x-3">
                    {tx.badges.map((badge) => (
                      <Badge
                        label={badge.label}
                        color={badge.color}
                        textColor={badge.textColor}
                      />
                    ))}
                  </div>
                ) : (
                  ""
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <p className="text-lg">{tx.totalAmount} sats</p>
                <p className="text-sm text-gray-500">{tx.date}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
