import Container from "@components/Container";
import TransactionsTable from "@components/TransactionsTable";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import { convertPaymentsToTransactions } from "~/app/utils/payments";
import api from "~/common/lib/api";
import { Transaction } from "~/types";

function Wallet() {
  const { t } = useTranslation("translation", {
    keyPrefix: "wallet",
  });

  const { settings, getFormattedFiat } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // @Todo: add SWR caching? Check where to reset/mutate the cache?
      const { payments } = await api.getPayments();
      const _transactions: Transaction[] = await convertPaymentsToTransactions(
        payments
      );

      for (const transaction of _transactions) {
        transaction.totalAmountFiat = settings.showFiat
          ? await getFormattedFiat(transaction.totalAmount)
          : "";
      }

      setTransactions(_transactions);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [settings, getFormattedFiat]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container>
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>

      <div>
        {transactions?.length > 0 && (
          <TransactionsTable transactions={transactions} />
        )}
      </div>
    </Container>
  );
}

export default Wallet;
