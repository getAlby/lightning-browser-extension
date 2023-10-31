import dayjs from "dayjs";
import { useCallback, useState } from "react";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";
import { Transaction } from "~/types";

export const useInvoices = () => {
  const { settings, getFormattedFiat } = useSettings();

  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [incomingTransactions, setIncomingTransactions] = useState<
    Transaction[]
  >([]);

  const loadInvoices = useCallback(
    async (limit?: number) => {
      setIsLoadingInvoices(true);
      let result;
      try {
        result = await api.getInvoices({ isSettled: true, limit });
      } catch (e) {
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
        setIsLoadingInvoices(false);
        return;
      }

      const invoices: Transaction[] = result.invoices.map((invoice) => ({
        ...invoice,
        title: invoice.memo,
        description: invoice.memo,
        date: dayjs(invoice.settleDate).fromNow(),
      }));

      for (const invoice of invoices) {
        invoice.totalAmountFiat = settings.showFiat
          ? await getFormattedFiat(invoice.totalAmount)
          : "";
      }

      setIncomingTransactions(invoices);
      setIsLoadingInvoices(false);
    },
    [getFormattedFiat, settings.showFiat]
  );

  return {
    isLoadingInvoices,
    incomingTransactions,
    loadInvoices,
  };
};
