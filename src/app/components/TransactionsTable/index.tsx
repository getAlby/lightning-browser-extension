import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Loading from "@components/Loading";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "~/app/components/Modal";
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
  const { getFormattedSats } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | undefined>();
  const { t: tCommon } = useTranslation("common");

  function openDetails(transaction: Transaction) {
    setTransaction(transaction);
    setModalOpen(true);
  }

  function getTransactionType(tx: Transaction): "incoming" | "outgoing" {
    return [tx.type && "sent", "sending"].includes(tx.type)
      ? "outgoing"
      : "incoming";
  }

  return loading ? (
    <div className="w-full flex flex-col items-center mt-4">
      <Loading />
    </div>
  ) : !transactions?.length && noResultMsg ? (
    <p className="text-gray-500 dark:text-neutral-400">{noResultMsg}</p>
  ) : (
    <>
      <div className="overflow-hidden">
        {transactions?.map((tx) => {
          const type = getTransactionType(tx);

          return (
            <div
              key={tx.id}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-surface-02dp cursor-pointer rounded-md"
              onClick={() => openDetails(tx)}
            >
              <div className="flex gap-3">
                <div className="flex items-center">
                  {type == "outgoing" ? (
                    <div className="flex justify-center items-center bg-orange-100 rounded-full w-8 h-8">
                      <ArrowUpIcon className="w-6 h-6 text-orange-400" />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center bg-green-100 rounded-full w-8 h-8">
                      <ArrowDownIcon className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden mr-3">
                  <div
                    className="
      text-sm font-medium text-black truncate dark:text-white"
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
                        tx.title ||
                        tx.boostagram?.message ||
                        (type == "incoming" ? "Received" : "Sent")
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400">
                    {tx.date}
                  </p>
                </div>
                <div className="flex ml-auto text-right space-x-3 shrink-0 dark:text-white">
                  <div>
                    <p
                      className={classNames(
                        "text-sm font-medium",
                        type == "incoming"
                          ? "text-green-600 dark:color-green-400"
                          : "text-orange-600 dark:color-orange-400",
                        "inline"
                      )}
                    >
                      {type == "outgoing" ? "-" : "+"}{" "}
                      {getFormattedSats(tx.totalAmount)}{" "}
                    </p>
                    <p className="inline text-gray-600 dark:text-neutral-400">
                      {tCommon("sats", {
                        count: Number(tx.totalAmount),
                      })}
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
      </div>
      <Modal
        isOpen={modalOpen}
        close={() => setModalOpen(false)}
        title={"test"}
      >
        {transaction && (
          <div className="p-3 flex flex-col gap-4 justify-center ">
            <div>
              <div className="flex items-center justify-center">
                {getTransactionType(transaction) == "outgoing" ? (
                  <div className="flex justify-center items-center bg-orange-100 rounded-full p-8">
                    <ArrowUpIcon className="w-12 h-12 text-orange-400" />
                  </div>
                ) : (
                  <div className="flex justify-center items-center bg-green-100 rounded-full p-8">
                    <ArrowDownIcon className="w-12 h-12 text-green-400" />
                  </div>
                )}
              </div>
            </div>
            <div>details</div>
          </div>
        )}
      </Modal>
    </>
  );
}
