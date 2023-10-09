import {
  CaretDownIcon,
  CaretUpIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
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

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="text-sm leading-5 text-gray-400 dark:text-neutral-500 text-right">
    {children}
  </dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="text-sm leading-5 text-gray-800 dark:text-neutral-200 col-span-2 break-all">
    {children}
  </dd>
);

const TransactionDetailRow = ({
  title,
  content,
}: {
  title: React.ReactNode;
  content: React.ReactNode;
}) => (
  <div className="grid grid-cols-3 gap-2 p-1">
    <Dt>{title}</Dt>
    <Dd>{content}</Dd>
  </div>
);

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
                  <ArrowUpIcon className="w-8 h-8 text-orange-400 stroke-[5px]" />
                </div>
              ) : (
                <div className="flex justify-center items-center bg-green-100 rounded-full p-8">
                  <ArrowDownIcon className="w-8 h-8 text-green-400 stroke-[5px]" />
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
                <p className="text-md mt-1 text-gray-400 dark:text-neutral-500">
                  ~{transaction.totalAmountFiat}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <TransactionDetailRow
              title="Date & Time"
              content={dayjs(transaction.timestamp).format(
                "D MMMM YYYY, HH:mm"
              )}
            />
            {transaction.totalFees?.toString && (
              <TransactionDetailRow
                title="Fee"
                content={getFormattedSats(transaction.totalFees)}
              />
            )}
            {transaction.publisherLink && transaction.title && (
              <TransactionDetailRow
                title="Website"
                content={
                  <Hyperlink
                    target="_blank"
                    href={transaction.publisherLink}
                    rel="noopener noreferrer"
                  >
                    {transaction.title}
                  </Hyperlink>
                }
              />
            )}
            {transaction.boostagram?.podcast && (
              <TransactionDetailRow
                title="Podcast"
                content={transaction.boostagram?.podcast}
              />
            )}
            {transaction.boostagram?.episode && (
              <TransactionDetailRow
                title="Episode"
                content={transaction.boostagram.episode}
              />
            )}
            {transaction.description && (
              <TransactionDetailRow
                title="Description"
                content={transaction.description}
              />
            )}
            {(transaction.preimage || transaction.paymentHash) && (
              <>
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
                {showMoreFields && (
                  <>
                    {transaction.preimage && (
                      <TransactionDetailRow
                        title="Preimage"
                        content={transaction.preimage}
                      />
                    )}
                    {transaction.paymentHash && (
                      <TransactionDetailRow
                        title="Payment hash"
                        content={transaction.paymentHash}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
