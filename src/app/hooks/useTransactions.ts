import dayjs from "dayjs";
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
        const fetchInvoice = await api.getInvoices({ isSettled: true, limit });

        const invoices: Transaction[] = fetchInvoice.invoices.map(
          (invoice) => ({
            ...invoice,
            title: invoice.memo,
            description: invoice.memo,
            date: dayjs(invoice.settleDate).fromNow(),
            timestamp: invoice.settleDate,
          })
        );

        const _transactions: Transaction[] =
          await convertPaymentsToTransactions(payments);

        const finalList: Transaction[] = [..._transactions, ...invoices];

        for (const transaction of finalList) {
          transaction.totalAmountFiat = settings.showFiat
            ? await getFormattedFiat(transaction.totalAmount)
            : "";
        }

        // Sort the final list by date in descending order.
        finalList.sort((a, b) => {
          const dateA = a.timestamp;
          const dateB = b.timestamp;
          return dateB - dateA;
        });

        setTransactions(finalList);

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
