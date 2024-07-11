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
          limit,
        });

        const transactions = getTransactionsResponse.transactions.map(
          (transaction) => ({
            ...transaction,
            title: transaction.memo,
            date: dayjs(transaction.settleDate).fromNow(),
            timestamp: transaction.settleDate,
          })
        );

        for (const transaction of transactions) {
          if (
            transaction.displayAmount &&
            transaction.displayAmount[1] === settings.currency
          )
            continue;
          transaction.totalAmountFiat = settings.showFiat
            ? await getFormattedFiat(transaction.totalAmount)
            : "";
        }

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
