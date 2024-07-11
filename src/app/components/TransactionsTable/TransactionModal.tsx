import {
  PopiconsArrowDownSolid,
  PopiconsArrowUpSolid,
  PopiconsChevronBottomLine,
  PopiconsChevronTopLine,
} from "@popicons/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Hyperlink from "~/app/components/Hyperlink";
import Modal from "~/app/components/Modal";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils";
import { Transaction } from "~/types";

type Props = {
  transaction: Transaction;
  onClose: () => void;
  isOpen: boolean;
};

export default function TransactionModal({
  transaction,
  isOpen,
  onClose,
}: Props) {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("components", {
    keyPrefix: "transactions_table",
  });
  const [showMoreFields, setShowMoreFields] = useState(false);
  const { getFormattedSats, getFormattedInCurrency } = useSettings();

  function toggleShowMoreFields() {
    setShowMoreFields(!showMoreFields);
  }

  useEffect(() => {
    setShowMoreFields(false);
  }, [transaction]);

  function getTransactionType(tx: Transaction): "incoming" | "outgoing" {
    return [tx.type && "sent"].includes(tx.type) ? "outgoing" : "incoming";
  }

  return (
    <Modal
      isOpen={isOpen}
      close={() => {
        onClose();
      }}
      contentLabel={"Transactions"}
      position="top"
    >
      <div className="p-3 flex flex-col gap-4 justify-center">
        <div>
          <div className="flex items-center justify-center">
            {getTransactionType(transaction) == "outgoing" ? (
              <div className="flex justify-center items-center bg-orange-100 dark:bg-orange-950 rounded-full p-3">
                <PopiconsArrowUpSolid className="w-10 h-10 text-orange-400 dark:text-amber-600 stroke-[1px] stroke-orange-400 dark:stroke-amber-600" />
              </div>
            ) : (
              <div className="flex justify-center items-center bg-green-100 dark:bg-emerald-950 rounded-full p-3">
                <PopiconsArrowDownSolid className="w-10 h-10 text-green-500 dark:text-emerald-500 stroke-[1px] stroke-green-400 dark:stroke-emerald-500" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-md text-gray-900 font-bold dark:text-white text-center">
            {transaction.type == "received" ? t("received") : t("sent")}
          </h2>
        </div>
        <div className="flex items-center text-center justify-center dark:text-white">
          <div>
            <p
              className={classNames(
                "text-3xl font-medium",
                transaction.type == "received"
                  ? "text-green-600 dark:text-emerald-500"
                  : "text-orange-600 dark:text-amber-600"
              )}
            >
              {transaction.type == "sent" ? "-" : "+"}{" "}
              {!transaction.displayAmount
                ? getFormattedSats(transaction.totalAmount)
                : getFormattedInCurrency(
                    transaction.displayAmount[0],
                    transaction.displayAmount[1]
                  )}
            </p>

            {!!transaction.totalAmountFiat && (
              <p className="text-md mt-1 text-gray-400 dark:text-neutral-500">
                ~{transaction.totalAmountFiat}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <TransactionDetailRow
            title={t("date_time")}
            content={dayjs(transaction.timestamp).format("D MMMM YYYY, HH:mm")}
          />
          {transaction.totalFees?.toString && (
            <TransactionDetailRow
              title={t("fee")}
              content={getFormattedSats(transaction.totalFees)}
            />
          )}
          {transaction.title && (
            <TransactionDetailRow
              title={tCommon("description")}
              content={transaction.title}
            />
          )}
          {transaction.publisherLink && transaction.title && (
            <TransactionDetailRow
              title={tCommon("website")}
              content={
                <>
                  <Hyperlink
                    target="_blank"
                    href={transaction.publisherLink}
                    rel="noopener noreferrer"
                  >
                    {transaction.title}
                  </Hyperlink>
                </>
              }
            />
          )}
          {transaction.boostagram?.message && (
            <TransactionDetailRow
              title={t("boostagram.message")}
              content={transaction.boostagram?.message}
            />
          )}
          {transaction.boostagram?.podcast && (
            <TransactionDetailRow
              title={t("boostagram.podcast")}
              content={transaction.boostagram?.podcast}
            />
          )}
          {transaction.boostagram?.episode && (
            <TransactionDetailRow
              title={t("boostagram.episode")}
              content={transaction.boostagram.episode}
            />
          )}
          {transaction.boostagram?.action && (
            <TransactionDetailRow
              title={t("boostagram.action")}
              content={transaction.boostagram.action}
            />
          )}
          {transaction.boostagram?.ts && (
            <TransactionDetailRow
              title={t("boostagram.timestamp")}
              content={transaction.boostagram.ts}
            />
          )}
          {transaction.boostagram?.value_msat_total && (
            <TransactionDetailRow
              title={t("boostagram.totalAmount")}
              content={Math.floor(
                transaction.boostagram.value_msat_total / 1000
              )}
            />
          )}
          {transaction.boostagram?.sender_name && (
            <TransactionDetailRow
              title={t("boostagram.sender")}
              content={transaction.boostagram.sender_name}
            />
          )}
          {transaction.boostagram?.app_name && (
            <TransactionDetailRow
              title={t("boostagram.app")}
              content={transaction.boostagram.app_name}
            />
          )}
          {(transaction.preimage || transaction.paymentHash) && (
            <>
              <div className="flex justify-center mt-4">
                <Hyperlink onClick={toggleShowMoreFields}>
                  {showMoreFields ? (
                    <>
                      {tCommon("actions.hide")}
                      <PopiconsChevronTopLine className="h-4 w-4 inline-flex" />
                    </>
                  ) : (
                    <>
                      {tCommon("actions.more")}
                      <PopiconsChevronBottomLine className="h-4 w-4 inline-flex" />
                    </>
                  )}
                </Hyperlink>
              </div>
              {showMoreFields && (
                <div className="mt-4">
                  {transaction.preimage && (
                    <TransactionDetailRow
                      title={t("preimage")}
                      content={transaction.preimage}
                    />
                  )}
                  {transaction.paymentHash && (
                    <TransactionDetailRow
                      title={t("payment_hash")}
                      content={transaction.paymentHash}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="w-24 text-gray-400 dark:text-neutral-500 text-right">
    {children}
  </dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="text-gray-800 dark:text-neutral-200 break-words whitespace-pre-wrap overflow-hidden">
    {children}
  </dd>
);

const TransactionDetailRow = ({
  title,
  content,
}: {
  title: React.ReactNode | string;
  content: React.ReactNode | string;
}) => (
  <div className="grid grid-cols-[auto,1fr] p-1 text-sm leading-5 space-x-3">
    <Dt>{title}</Dt>
    <Dd>{content}</Dd>
  </div>
);
