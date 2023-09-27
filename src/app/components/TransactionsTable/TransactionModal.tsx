import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  CaretUpIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Hyperlink from "~/app/components/Hyperlink";
import Modal from "~/app/components/Modal";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils";
import { Transaction } from "~/types";

type Props = {
  transaction: Transaction | undefined;
  onModelClose: () => void;
  isOpen: boolean;
};

export default function TransactionModal({
  transaction,
  isOpen,
  onModelClose,
}: Props) {
  const { t: tCommon } = useTranslation("common");
  const [showMoreFields, setShowMoreFields] = useState(false);
  const { getFormattedSats } = useSettings();
  const [_isRevealed, setRevealed] = useState(false);

  function toggleShowMoreFields() {
    setShowMoreFields(!showMoreFields);
  }

  function getTransactionType(tx: Transaction): "incoming" | "outgoing" {
    return [tx.type && "sent", "sending"].includes(tx.type)
      ? "outgoing"
      : "incoming";
  }

  useEffect(() => {
    if (typeof isOpen !== "undefined") {
      setRevealed(isOpen);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={_isRevealed}
      close={() => {
        setRevealed(false);
        onModelClose();
        setShowMoreFields(false);
      }}
      title={"Transactions"}
    >
      {_isRevealed && transaction && (
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
                {getFormattedSats(transaction.totalAmount)}
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
                  {transaction.totalFees?.toString && (
                    <div className="grid grid-cols-3 gap-2 px-0 p-1">
                      <dt className="text-md text-right font-medium leading-6 text-gray-400 dark:text-neutral-600">
                        Fee
                      </dt>
                      <dd className=" text-md leading-6  text-gray-900 dark:text-white col-span-2 mt-0 break-all">
                        {getFormattedSats(transaction.totalFees)}
                      </dd>
                    </div>
                  )}
                  {transaction.publisherLink && transaction.title && (
                    <div className="grid grid-cols-3 gap-2 px-0 p-1">
                      <dt className="text-md text-right font-medium leading-6 text-gray-400 dark:text-neutral-600">
                        Website
                      </dt>
                      <dd className=" text-md leading-6 col-span-2 mt-0 break-all">
                        <a
                          className="cursor-pointer text-blue-600 hover:text-blue-700"
                          target="_blank"
                          href={transaction.publisherLink}
                          rel="noopener noreferrer"
                        >
                          {transaction.title}
                        </a>
                      </dd>
                    </div>
                  )}

                  {transaction.boostagram?.podcast && (
                    <div className="grid grid-cols-3 gap-2 px-0 p-1">
                      <dt className="text-md text-right font-medium leading-6 text-gray-400 dark:text-neutral-600">
                        Podcast
                      </dt>
                      <dd className=" text-md leading-6  text-gray-900 dark:text-white col-span-2 mt-0 break-all">
                        {transaction.boostagram?.podcast}
                      </dd>
                    </div>
                  )}
                  {transaction.boostagram?.episode && (
                    <div className="grid grid-cols-3 gap-2 px-0 p-1">
                      <dt className="text-md text-right font-medium leading-6 text-gray-400 dark:text-neutral-600">
                        Episode
                      </dt>
                      <dd className=" text-md leading-6  text-gray-900 dark:text-white col-span-2 mt-0 break-all">
                        {transaction.boostagram.episode}
                      </dd>
                    </div>
                  )}
                  {transaction.description && (
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
  );
}
