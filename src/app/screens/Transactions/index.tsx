import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Container from "@components/Container";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Header from "~/app/components/Header";
import IconButton from "~/app/components/IconButton";
import { useAccount } from "~/app/context/AccountContext";
import { useTransactions } from "~/app/hooks/useTransactions";

function Transactions() {
  const { t } = useTranslation("translation", {
    keyPrefix: "transactions",
  });

  const navigate = useNavigate();

  const { accountLoading } = useAccount();
  const { transactions, isLoadingTransactions, loadTransactions } =
    useTransactions();

  const isLoading = accountLoading || isLoadingTransactions;

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        headerLeft={
          <IconButton
            onClick={() => navigate(-1)}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      >
        {t("title")}
      </Header>

      <Container>
        <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
          {t("title")}
        </h2>

        <p className="mb-6 text-gray-500 dark:text-neutral-500">
          {t("description")}
        </p>

        {isLoading ? (
          <div className="flex justify-center mt-12">
            <Loading />
          </div>
        ) : (
          <div>
            {transactions && transactions.length > 0 && (
              <TransactionsTable transactions={transactions} />
            )}
          </div>
        )}
      </Container>
    </div>
  );
}

export default Transactions;
