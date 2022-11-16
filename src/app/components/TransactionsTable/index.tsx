import { CaretDownIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { Disclosure } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import Button from "~/app/components/Button";
import { Transaction } from "~/types";

import Badge from "../Badge";

export type Props = {
  transactions: Transaction[];
};

export default function TransactionsTable({ transactions }: Props) {
  const { t: tCommon } = useTranslation("common");
  const { t: tComponents } = useTranslation("components");

  return (
    <div className="shadow overflow-hidden rounded-lg">
      <div className="bg-white divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
        {transactions.map((tx) => (
          <div key={tx.id} className="px-3 py-2">
            <Disclosure>
              {({ open }) => (
                <>
                  <div className="flex">
                    <div className="overflow-hidden mr-3">
                      <div
                        className="
                      text-sm font-medium text-gray-900 truncate dark:text-white"
                      >
                        <p className="truncate">
                          {tx.publisherLink && tx.title ? (
                            <a
                              target="_blank"
                              href={tx.publisherLink}
                              rel="noopener noreferrer"
                            >
                              {tx.title}
                            </a>
                          ) : (
                            tx.title || tx.boostagram?.message || "\u00A0"
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-neutral-400">
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
                          {tx.totalAmount}{" "}
                          {tCommon("sats", { count: tx.totalAmount as number })}
                        </p>
                        {!!tx.totalAmountFiat && (
                          <p className="text-xs text-gray-600 dark:text-neutral-400">
                            ~{tx.totalAmountFiat}
                          </p>
                        )}
                      </div>
                      {(!!tx.description ||
                        [tx.type && "sent", "sending"].includes(tx.type) ||
                        (tx.type === "received" && tx.boostagram)) && (
                        <Disclosure.Button className="block text-gray-500 hover:text-black dark:hover:text-white transition-color duration-200">
                          <CaretDownIcon
                            className={`${open ? "rotate-180" : ""} w-5 h-5`}
                          />
                        </Disclosure.Button>
                      )}
                    </div>
                  </div>
                  <Disclosure.Panel>
                    <div className="text-xs text-gray-600 dark:text-neutral-400">
                      {(tx.description || tx.boostagram) && (
                        <div className="my-2">
                          {tx.description && <p>{tx.description}</p>}
                          {tx.boostagram && (
                            <ul>
                              <li>
                                {tComponents(
                                  "transactionsTable.boostagram.sender"
                                )}
                                : {tx.boostagram.sender_name}
                              </li>
                              <li>
                                {tComponents(
                                  "transactionsTable.boostagram.message"
                                )}
                                : {tx.boostagram.message}
                              </li>
                              <li>
                                {tComponents(
                                  "transactionsTable.boostagram.app"
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
                      )}
                      {(tx.totalFees != undefined || tx.location) && (
                        <div className="my-2 flex items-center justify-between">
                          {tx.totalFees != undefined && (
                            <p className="flex-none">
                              <span className="font-bold">
                                {tComponents("transactionsTable.fee")}
                              </span>
                              <br />
                              {tx.totalFees}{" "}
                              {tCommon("sats", { count: tx.totalFees })}
                            </p>
                          )}
                          {tx.location && (
                            <a
                              className="flex-none"
                              href={tx.location}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <Button
                                primary
                                label={tComponents("Open website")}
                              />
                            </a>
                          )}
                        </div>
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
