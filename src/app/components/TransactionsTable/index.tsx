import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Loading from "@components/Loading";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("components");

  return loading ? (
    <div className="w-full flex flex-col items-center mt-4">
      <Loading />
    </div>
  ) : !transactions?.length && noResultMsg ? (
    <p className="text-gray-500 dark:text-neutral-400">{noResultMsg}</p>
  ) : (
    <div className="shadow overflow-hidden rounded-lg bg-white divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
      {transactions?.map((tx) => {
        const type = [tx.type && "sent", "sending"].includes(tx.type)
          ? "outgoing"
          : "incoming";

        return (
          <div
            key={tx.id}
            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-surface-02dp cursor-pointer"
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
                        : ""
                    )}
                  >
                    {type == "outgoing" ? "-" : "+"}
                    {getFormattedSats(tx.totalAmount)}
                  </p>
                  {!!tx.totalAmountFiat && (
                    <p className="text-xs text-gray-600 dark:text-neutral-400">
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
  );
}
