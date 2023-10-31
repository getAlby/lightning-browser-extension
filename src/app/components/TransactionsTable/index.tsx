import { CaretDownIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Loading from "@components/Loading";
import { Disclosure } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import Button from "~/app/components/Button";
import { useSettings } from "~/app/context/SettingsContext";
import { Transaction } from "~/types";

export type Props = {
  transactions: Transaction[] | null | undefined;
  loading?: boolean;
  noResultMsg?: string;
};

export default function TransactionsTable({
  transactions,
  noResultMsg,
  loading = false,
}: Props) {
  const { getFormattedSats } = useSettings();
  const { t } = useTranslation("components");

  return loading ? (
    <div className="w-full flex flex-col items-center mt-4">
      <Loading />
    </div>
  ) : !transactions?.length && noResultMsg ? (
    <p className="text-gray-500 dark:text-neutral-400">{noResultMsg}</p>
  ) : (
    <>
      <div className="shadow overflow-hidden rounded-lg bg-white divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
        {transactions?.map((tx) => (
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
                    <div className="flex ml-auto text-right space-x-3 shrink-0">
                      <div>
                        <p className="text-sm font-medium dark:text-white">
                          {[tx.type && "sent", "sending"].includes(tx.type)
                            ? "-"
                            : "+"}
                          {getFormattedSats(tx.totalAmount)}
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
                                {t("transactionsTable.boostagram.sender")}:{" "}
                                {tx.boostagram.sender_name}
                              </li>
                              <li>
                                {t("transactionsTable.boostagram.message")}:{" "}
                                {tx.boostagram.message}
                              </li>
                              <li>
                                {t("transactionsTable.boostagram.app")}:{" "}
                                {tx.boostagram.app_name}
                              </li>
                              <li>
                                {t("transactionsTable.boostagram.podcast")}:{" "}
                                {tx.boostagram.podcast}
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                      {(tx.totalFees !== undefined || tx.location) && (
                        <div className="my-2 flow-root">
                          {tx.totalFees !== undefined && (
                            <p className="float-left">
                              <span className="font-bold">
                                {t("transactionsTable.fee")}
                              </span>
                              <br />
                              {getFormattedSats(tx.totalFees)}
                            </p>
                          )}
                          {tx.location && (
                            <a
                              className="float-right"
                              href={tx.location}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <Button
                                primary
                                label={t("transactionsTable.open_location")}
                              />
                            </a>
                          )}
                        </div>
                      )}
                      {tx.preimage && (
                        <div className="my-2 flow-root">
                          <p className="float-left break-all">
                            <span className="font-bold">
                              {t("transactionsTable.preimage")}
                            </span>
                            <br />
                            {tx.preimage}
                          </p>
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
    </>
  );
}
