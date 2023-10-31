import { useCallback, useState } from "react";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import { convertPaymentsToTransactions } from "~/app/utils/payments";
import api from "~/common/lib/api";
import { Transaction } from "~/types";

export const useTransactions = () => {
  const { settings, getFormattedFiat } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const loadTransactions = useCallback(
    async (accountId: string, limit?: number) => {
      try {
        const { payments } = await api.getPaymentsByAccount({
          accountId,
          limit,
        });
        const _transactions: Transaction[] =
          await convertPaymentsToTransactions(payments);

        for (const transaction of _transactions) {
          transaction.totalAmountFiat = settings.showFiat
            ? await getFormattedFiat(transaction.totalAmount)
            : "";
        }

        setTransactions(_transactions);
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
