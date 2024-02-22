import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import Loading from "@components/Loading";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import TransactionModal from "~/app/components/TransactionsTable/TransactionModal";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils";
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
  const { getFormattedSats, getFormattedInCurrency } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | undefined>();
  const { t } = useTranslation("components", {
    keyPrefix: "transactions_table",
  });

  function openDetails(transaction: Transaction) {
    setTransaction(transaction);
    setModalOpen(true);
  }

  function getTransactionType(tx: Transaction): "incoming" | "outgoing" {
    return [tx.type && "sent"].includes(tx.type) ? "outgoing" : "incoming";
  }

  return (
    <div className="mt-4">
      {loading ? (
        <div className="w-full flex flex-col items-center">
          <Loading />
        </div>
      ) : !transactions?.length && noResultMsg ? (
        <p className="text-gray-500 dark:text-neutral-400">{noResultMsg}</p>
      ) : (
        <>
          {transactions?.map((tx) => {
            const type = getTransactionType(tx);

            return (
              <div
                key={tx.id}
                className="-mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-surface-02dp cursor-pointer rounded-md"
                onClick={() => openDetails(tx)}
              >
                <div className="flex gap-3">
                  <div className="flex items-center">
                    {type == "outgoing" ? (
                      <div className="flex justify-center items-center bg-orange-100 dark:bg-[#261911] rounded-full w-8 h-8">
                        <ArrowUpIcon className="w-4 h-4 text-orange-400 stroke-[4px]" />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center bg-green-100 dark:bg-[#0F1E1A] rounded-full w-8 h-8">
                        <ArrowDownIcon className="w-4 h-4 text-green-400 stroke-[4px]" />
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden mr-3">
                    <div className="text-sm font-medium text-black truncate dark:text-white">
                      <p className="truncate">
                        {tx.title ||
                          tx.boostagram?.message ||
                          (type == "incoming" ? t("received") : t("sent"))}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">
                      {tx.date}
                    </p>
                  </div>
                  <div className="flex ml-auto text-right space-x-3 shrink-0 dark:text-white">
                    <div>
                      <p
                        className={classNames(
                          "text-sm",
                          type == "incoming"
                            ? "text-green-600 dark:color-green-400"
                            : "text-orange-600 dark:color-orange-400"
                        )}
                      >
                        {type == "outgoing" ? "-" : "+"}{" "}
                        {!tx.displayAmount
                          ? getFormattedSats(tx.totalAmount)
                          : getFormattedInCurrency(
                              tx.displayAmount[0],
                              tx.displayAmount[1]
                            )}
                      </p>

                      {!!tx.totalAmountFiat && (
                        <p className="text-xs text-gray-400 dark:text-neutral-600">
                          ~{tx.totalAmountFiat}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {transaction && (
            <TransactionModal
              transaction={transaction}
              isOpen={modalOpen}
              onClose={() => {
                setModalOpen(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
