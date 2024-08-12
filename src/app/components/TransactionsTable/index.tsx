import Loading from "@components/Loading";
import { PopiconsArrowDownSolid, PopiconsArrowUpSolid } from "@popicons/react";

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
    <div>
      {loading ? (
        <div className="w-full flex flex-col items-center">
          <Loading />
        </div>
      ) : !transactions?.length ? (
        <p className="text-gray-500 dark:text-neutral-400 text-center">
          {t("no_transactions")}
        </p>
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
                      <div className="flex justify-center items-center bg-orange-100 dark:bg-orange-950 rounded-full w-8 h-8">
                        <PopiconsArrowUpSolid className="w-5 h-5 text-orange-400 dark:text-amber-600 stroke-[1px] stroke-orange-400 dark:stroke-amber-600" />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center bg-green-100 dark:bg-emerald-950 rounded-full w-8 h-8">
                        <PopiconsArrowDownSolid className="w-5 h-5 text-green-500 dark:text-emerald-500 stroke-[1px] stroke-green-400 dark:stroke-emerald-500" />
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
                            ? "text-green-600 dark:text-emerald-500"
                            : "text-orange-600 dark:text-amber-600"
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
