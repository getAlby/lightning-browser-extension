import {
  PlusIcon,
  MinusIcon,
  CaretDownIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { Disclosure } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Transaction } from "~/types";

import Badge from "../Badge";

export type Props = {
  transactions: Transaction[];
};

export default function TransactionsTable({ transactions }: Props) {
  const { t: tComponents } = useTranslation("components");

  function renderIcon(type: string) {
    function getIcon() {
      const iconClasses = "h-3 w-3";
      switch (type) {
        case "received":
          return <PlusIcon className={iconClasses} />;
        case "sent":
        case "sending":
          return <MinusIcon className={iconClasses} />;
      }
    }

    return (
      <div className="flex justify-center items-center w-6 h-6 border-2 border-gray-200 rounded-full dark:text-white">
        {getIcon()}
      </div>
    );
  }

  return (
    <div className="shadow overflow-hidden rounded-lg">
      <div className="bg-white divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
        {transactions.map((tx) => (
          <div key={tx.id} className="px-3 py-2">
            <Disclosure>
              {({ open }) => (
                <>
                  <div className="flex">
                    <div className="flex items-center shrink-0 mr-3">
                      {tx.type && renderIcon(tx.type)}
                    </div>
                    <div className="overflow-hidden mr-3">
                      <div className="text-sm font-medium text-gray-900 truncate dark:text-white">
                        {tx.title}
                      </div>
                      <p className="text-xs text-gray-600 capitalize dark:text-neutral-400">
                        {tComponents(`transactionsTable.${tx.type}`)} -{" "}
                        {tx.date}
                      </p>
                    </div>
                    {tx.badges && (
                      <div className="ml-6 space-x-3">
                        {tx.badges.map((badge) => (
                          <Badge
                            key={badge.label}
                            label={badge.label}
                            color={badge.color}
                            textColor={badge.textColor}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex ml-auto text-right space-x-3 shrink-0">
                      <div>
                        <p className="text-sm font-medium dark:text-white">
                          {[tx.type && "sent", "sending"].includes(tx.type)
                            ? "-"
                            : "+"}
                          {tx.totalAmount} sats
                        </p>
                        <p className="text-xs text-gray-600 dark:text-neutral-400">
                          ~{tx.totalAmountFiat}
                        </p>
                      </div>
                      {([tx.type && "sent", "sending"].includes(tx.type) ||
                        (tx.type === "received" && tx.boostagram)) && (
                        <Disclosure.Button className="block h-0 mt-2 text-gray-500 hover:text-black dark:hover:text-white transition-color duration-200">
                          <CaretDownIcon
                            className={`${open ? "rotate-180" : ""} w-5 h-5`}
                          />
                        </Disclosure.Button>
                      )}
                    </div>
                  </div>
                  <Disclosure.Panel>
                    <div className="mt-1 ml-9 text-xs text-gray-600 dark:text-neutral-400">
                      <p>{tx.description}</p>
                      {tx.totalFees && (
                        <p>
                          {tComponents("transactionsTable.fee")}: {tx.totalFees}{" "}
                          sats
                        </p>
                      )}
                      {tx.preimage && (
                        <p className="truncate">
                          {tComponents("transactionsTable.preimage")}:{" "}
                          {tx.preimage}
                        </p>
                      )}
                      {tx.location && (
                        <a href={tx.location} target="_blank" rel="noreferrer">
                          {tx.location}
                        </a>
                      )}
                      {tx.boostagram && (
                        <ul>
                          <li>
                            {tComponents(
                              "transactionsTable.boostagram.sender_name"
                            )}
                            : {tx.boostagram.sender_name}
                          </li>
                          <li>
                            {tComponents(
                              "transactionsTable.boostagram.message"
                            )}
                            :{" "}
                            {tx.boostagram.message &&
                              decodeURI(tx.boostagram.message)}
                          </li>
                          <li>
                            {tComponents(
                              "transactionsTable.boostagram.app_name"
                            )}
                            : {tx.boostagram.app_name}
                          </li>
                          <li>
                            {tComponents(
                              "transactionsTable.boostagram.podcast"
                            )}
                            : {tx.boostagram.podcast}
                          </li>
                        </ul>
                      )}
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
