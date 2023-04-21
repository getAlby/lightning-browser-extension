import Container from "@components/Container";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import { convertPaymentsToTransactions } from "~/app/utils/payments";
import api from "~/common/lib/api";
import { Transaction } from "~/types";

function Transactions() {
  const { t } = useTranslation("translation", {
    keyPrefix: "transactions",
  });

  const { settings, getFormattedFiat } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] =
    useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setTransactionsLoading(true);

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
    } finally {
      setTransactionsLoading(false);
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

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("description")}
      </p>

      {transactionsLoading ? (
        <div className="flex justify-center mt-12">
          <Loading />
        </div>
      ) : (
        <div>
          {transactions?.length > 0 && (
            <TransactionsTable transactions={transactions} />
          )}
        </div>
      )}
    </Container>
  );
}

export default Transactions;
