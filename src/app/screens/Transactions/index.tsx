import Container from "@components/Container";
import TransactionsTable from "@components/TransactionsTable";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import { convertPaymentsToTransactions } from "~/app/utils/payments";
import msg from "~/common/lib/msg";
import { Payment, Transaction } from "~/types";

function Transactions() {
  const { t } = useTranslation("translation", {
    keyPrefix: "transactions",
  });

  const { settings, getFormattedFiat } = useSettings();
  const [payments, setPayments] = useState<Transaction[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const { payments } = await msg.request<{ payments: Payment[] }>(
        "getPayments"
      );
      const transactions: Transaction[] =
        convertPaymentsToTransactions(payments);

      for (const transaction of transactions) {
        transaction.totalAmountFiat = settings.showFiat
          ? await getFormattedFiat(transaction.totalAmount)
          : "";
      }

      setPayments(transactions);
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

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("description")}
      </p>

      <div>
        {payments?.length > 0 && <TransactionsTable transactions={payments} />}
      </div>
    </Container>
  );
}

export default Transactions;
