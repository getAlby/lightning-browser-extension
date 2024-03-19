import Container from "@components/Container";
import TransactionsTable from "@components/TransactionsTable";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "~/app/context/AccountContext";
import { useTransactions } from "~/app/hooks/useTransactions";

function Transactions() {
  const { t } = useTranslation("translation", {
    keyPrefix: "transactions",
  });

  const { accountLoading } = useAccount();
  const { transactions, isLoadingTransactions, loadTransactions } =
    useTransactions();

  const isLoading = accountLoading || isLoadingTransactions;

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <Container>
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("description")}
      </p>

      <TransactionsTable loading={isLoading} transactions={transactions} />
    </Container>
  );
}

export default Transactions;
