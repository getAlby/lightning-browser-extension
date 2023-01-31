import Container from "@components/Container";
import TransactionsTable from "@components/TransactionsTable";
import { useTranslation } from "react-i18next";
import { Transaction } from "~/types";

function Transactions() {
  const { t } = useTranslation("translation");

  const transactions: Transaction[] = [];

  return (
    <Container>
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("transactions.title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t("transactions.description")}
      </p>

      <div className="mb-12">
        <div>
          {transactions?.length > 0 && (
            <TransactionsTable transactions={transactions} />
          )}
          {!transactions?.length && (
            <p className="mb-6 text-gray-500 dark:text-neutral-500">
              {t("transactions.list_empty")}
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}

export default Transactions;
