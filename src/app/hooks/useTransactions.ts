import dayjs from "dayjs";
import { useCallback, useState } from "react";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";
import { Transaction } from "~/types";

export const useTransactions = () => {
  const { settings, getFormattedFiat } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const loadTransactions = useCallback(
    async (limit?: number) => {
      try {
        const getTransactionsResponse = await api.getTransactions({
          isSettled: true,
          limit,
        });
        const transactions = getTransactionsResponse.transactions.map(
          (transaction) => ({
            ...transaction,
            title: transaction.memo,
            description: transaction.memo,
            date: dayjs(transaction.settleDate).fromNow(),
            timestamp: transaction.settleDate,
          })
        );

        for (const transaction of transactions) {
          transaction.totalAmountFiat = settings.showFiat
            ? await getFormattedFiat(transaction.totalAmount)
            : "";
        }

        // Sort the final list by date in descending order.
        transactions.sort((a, b) => {
          const dateA = a.timestamp;
          const dateB = b.timestamp;
          return dateB - dateA;
        });

        setTransactions(transactions);

        setIsLoadingTransactions(false);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
      }
    },
    [settings, getFormattedFiat]
  );

  return {
    transactions,
    isLoadingTransactions,
    loadTransactions,
  };
};
