import React from "react";
import {
  PlusCircleIcon,
  MinusCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";

import Badge from "../Shared/badge";

type Props = {
  transactions: Transaction[];
};

type Transaction = {
  type: string;
  email: string;
  title: string;
  date: string;
  amount: string;
  currency: string;
  value: string;
};

export default function TransactionsTable({ transactions }: Props) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <tbody className="bg-white divide-y divide-gray-200">
        {transactions.map((tx) => (
          <tr key={tx.email}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8">
                  {tx.type == "received" ? (
                    <PlusCircleIcon
                      className="h-5 w-5 border-gray-200 text-black"
                      text-black
                      aria-hidden="true"
                    />
                  ) : (
                    ""
                  )}
                  {tx.type == "sent" ? (
                    <MinusCircleIcon
                      className="h-5 w-5 border-gray-200 text-black"
                      text-black
                      aria-hidden="true"
                    />
                  ) : (
                    ""
                  )}
                  {tx.type == "sending" ? (
                    <MinusCircleIcon
                      className="h-5 w-5 border-gray-200 text-black"
                      text-black
                      aria-hidden="true"
                    />
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
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-900">
                    <p className="inline mr-10"> {tx.title}</p>
                  </div>
                  <div className="text-sm text-gray-500">{tx.date}</div>
                  <div className="text-sm text-red-600 font-semibold">
                    {tx.error}
                  </div>
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
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <p className="text-sm font-semibold mb-2">{tx.amount}</p>
              <p className="text-gray-500">
                {tx.currency} {tx.value}
              </p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
