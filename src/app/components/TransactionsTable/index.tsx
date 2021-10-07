import React from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/solid";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";

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
      const iconClasses = "h-3 w-3";
      switch (type) {
        case "received":
          return <PlusIcon className={iconClasses} aria-hidden="true" />;
        case "sent":
        case "sending":
          return <MinusIcon className={iconClasses} aria-hidden="true" />;
      }
    }

    return (
      <div className="flex justify-center items-center w-6 h-6 border-2 border-gray-200 rounded-full">
        {getIcon()}
      </div>
    );
  }

  return (
    <div className="shadow overflow-hidden rounded-lg">
      <div className="bg-white divide-y divide-gray-200">
        {transactions.map((tx) => (
          <div className="px-3 py-2">
            <Disclosure>
              {({ open }) => (
                <>
                  <div key={tx.id} className="flex">
                    <div className="flex items-center flex-shrink-0 mr-3">
                      {tx.type && renderIcon(tx.type)}
                    </div>
                    <div className="overflow-hidden mr-3">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {tx.title}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">
                        {tx.type}
                      </p>
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
                    <div className="flex ml-auto text-right space-x-3 flex-shrink-0">
                      <div>
                        <p className="text-sm font-medium">
                          {tx.type === "sent" || "sending" ? "-" : "+"}
                          {tx.totalAmount} sats
                        </p>
                        <p className="text-xs text-gray-400">{tx.date}</p>
                      </div>
                      <Disclosure.Button className="block h-0 mt-2">
                        <ChevronDownIcon
                          className={`${
                            open ? "transform rotate-180" : ""
                          } w-5 h-5 text-gray-500`}
                        />
                      </Disclosure.Button>
                    </div>
                  </div>
                  <Disclosure.Panel>
                    <div className="mt-1 ml-9 text-xs text-gray-500">
                      {tx.description}
                      <p className="truncate">Preimage: {tx.preimage}</p>
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </div>
  );
}
