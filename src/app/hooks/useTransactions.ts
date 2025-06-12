import dayjs from "dayjs";
import { useCallback, useState } from "react";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";
import { Transaction } from "~/types";

export const useTransactions = () => {
  const { settings, getFormattedFiat } = useSettings();
  const { account } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const processTransactions = useCallback(
    async (rawTransactions: any[]) => {
      const processedTransactions = rawTransactions.map((transaction) => ({
        ...transaction,
        title: transaction.memo,
        timeAgo: dayjs(
          transaction.settleDate || transaction.creationDate
        ).fromNow(),
        timestamp: transaction.settleDate || transaction.creationDate,
      }));

      for (const transaction of processedTransactions) {
        if (
          transaction.displayAmount &&
          transaction.displayAmount[1] === settings.currency
        )
          continue;
        transaction.totalAmountFiat = settings.showFiat
          ? await getFormattedFiat(transaction.totalAmount)
          : "";
      }

      return processedTransactions;
    },
    [settings, getFormattedFiat]
  );

  const loadTransactions = useCallback(
    async (limit?: number) => {
      if (!account?.id) return;

      try {
        let hasReceivedResponse = false;

        // Use SWR to get cached data first, then fresh data
        await api.swr.getTransactions(
          account.id,
          { limit },
          async (response) => {
            const processedTransactions = await processTransactions(
              response.transactions
            );
            setTransactions(processedTransactions);
            
            // Set loading to false after we get the first response (cached or fresh)
            if (!hasReceivedResponse) {
              setIsLoadingTransactions(false);
              hasReceivedResponse = true;
            }
          }
        );

        // If we didn't get any cached data, we still need to ensure loading is set to false
        if (!hasReceivedResponse) {
          setIsLoadingTransactions(false);
        }
      } catch (e) {
        console.error(e);
        setIsLoadingTransactions(false);
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
      }
    },
    [account?.id, processTransactions]
  );

  const refreshTransactions = useCallback(
    async (limit?: number) => {
      if (!account?.id) return;

      // Clear cache first to force fresh data
      await api.clearTransactionsCache(account.id);
      await loadTransactions(limit);
    },
    [account?.id, loadTransactions]
  );

  return {
    transactions,
    isLoadingTransactions,
    loadTransactions,
    refreshTransactions,
  };
};
