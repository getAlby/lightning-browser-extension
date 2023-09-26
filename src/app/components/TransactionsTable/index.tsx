import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  CaretUpIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Loading from "@components/Loading";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Hyperlink from "~/app/components/Hyperlink";
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
  const [showMoreFields, setShowMoreFields] = useState(false);

  function openDetails(transaction: Transaction) {
    setTransaction(transaction);
    setModalOpen(true);
  }

  function getTransactionType(tx: Transaction): "incoming" | "outgoing" {
    return [tx.type && "sent", "sending"].includes(tx.type)
      ? "outgoing"
      : "incoming";
  }

  function toggleShowMoreFields() {
    setShowMoreFields(!showMoreFields);
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
                          {transactionTitle(tx)}
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
                          : "text-orange-600 dark:color-orange-400"
                      )}
                    >
                      {type == "outgoing" ? "-" : "+"}{" "}
                      {getFormattedSats(tx.totalAmount).replace(/sats?/g, " ")}
                      <span className=" text-gray-800 dark:text-neutral-400">
                        {tCommon("sats", {
                          count: Number(tx.totalAmount),
                        })}
                      </span>
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
        title={"Transactions"}
      >
        {transaction && (
          <div className="p-3 flex flex-col gap-4 justify-center ">
            <div>
              <div className="flex items-center justify-center">
                {getTransactionType(transaction) == "outgoing" ? (
                  <div className="flex justify-center items-center bg-orange-100 rounded-full p-8">
                    <ArrowUpIcon className="w-8 h-8 text-orange-400" />
                  </div>
                ) : (
                  <div className="flex justify-center items-center bg-green-100 rounded-full p-8">
                    <ArrowDownIcon className="w-8 h-8 text-green-400" />
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-md text-gray-900 font-bold dark:text-white text-center">
                {transaction.type == "received" ? "Received" : "Sent"}
              </h2>
            </div>
            <div className="flex items-center text-center justify-center dark:text-white">
              <div>
                <p
                  className={classNames(
                    "text-3xl font-medium",
                    transaction.type == "received"
                      ? "text-green-600 dark:color-green-400"
                      : "text-orange-600 dark:color-orange-400",
                    "inline"
                  )}
                >
                  {transaction.type == "sent" ? "-" : "+"}{" "}
                  {getFormattedSats(transaction.totalAmount).replace(
                    /sats?/g,
                    " "
                  )}
                  <span className=" text-gray-800 dark:text-neutral-400">
                    {tCommon("sats", {
                      count: Number(transaction.amount),
                    })}
                  </span>
                </p>

                {!!transaction.totalAmountFiat && (
                  <p className="text-md mt-1 text-gray-400 dark:text-neutral-600">
                    ~{transaction.totalAmountFiat}
                  </p>
                )}
              </div>
            </div>
            <div>
              <div>
                <div className="mt-6">
                  <dl>
                    <div className="grid grid-cols-3 gap-2 p-1">
                      <dt className="text-md font-medium leading-6 text-gray-400 dark:text-neutral-600 text-right">
                        Date & Time
                      </dt>
                      <dd className="text-md leading-6  text-gray-900 dark:text-white col-span-2 mt-0 break-all">
                        {dayjs(transaction.timestamp).format(
                          "D MMMM YYYY, HH:mm"
                        )}
                      </dd>
                    </div>
                    {transaction.totalFees !== undefined && (
                      <div className="grid grid-cols-3 gap-2 px-0 p-1">
                        <dt className="text-md text-right font-medium leading-6 text-gray-400 dark:text-neutral-600">
                          Fee
                        </dt>
                        <dd className=" text-md leading-6  text-gray-900 dark:text-white col-span-2 mt-0 break-all">
                          {transaction.totalFees} Sats
                        </dd>
                      </div>
                    )}
                    {transaction.description !== undefined && (
                      <div className="grid grid-cols-3 gap-2 px-0 p-1">
                        <dt className="text-md text-right font-medium leading-6 text-gray-400 dark:text-neutral-600">
                          Description
                        </dt>
                        <dd className=" text-md leading-6  text-gray-900 dark:text-white col-span-2 mt-0 break-all">
                          {transaction.description}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-center mt-4">
                      <Hyperlink onClick={toggleShowMoreFields}>
                        {tCommon("actions.more")}{" "}
                        {showMoreFields ? (
                          <CaretUpIcon className="h-4 w-4 inline-flex" />
                        ) : (
                          <CaretDownIcon className="h-4 w-4 inline-flex" />
                        )}
                      </Hyperlink>
                    </div>
                    {showMoreFields && transaction.type == "sent" && (
                      <div className="grid grid-cols-3 gap-2 px-0 p-1">
                        <dt className="text-md text-right font-medium leading-6 text-gray-400 dark:text-neutral-600">
                          Preimage
                        </dt>
                        <dd className=" text-md leading-6  text-gray-900 dark:text-white col-span-2 mt-0 break-all">
                          {transaction.preimage}
                        </dd>
                      </div>
                    )}
                    {showMoreFields && transaction.type == "sent" && (
                      <div className="grid grid-cols-3 gap-2 px-0 p-1">
                        <dt className="text-md text-right font-medium leading-6 text-gray-400 dark:text-neutral-600">
                          Hash
                        </dt>
                        <dd className=" text-md leading-6  text-gray-900 dark:text-white col-span-2 mt-0 break-all">
                          {transaction.paymentHash}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function transactionTitle(tx: Transaction) {
  const title = tx.title;

  if (title) return title;
}
