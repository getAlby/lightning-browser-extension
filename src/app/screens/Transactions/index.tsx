import Container from "@components/Container";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "~/app/context/AccountContext";
import { useInvoices } from "~/app/hooks/useInvoices";
import { useTransactions } from "~/app/hooks/useTransactions";

type Props = {
  type: "incoming" | "outgoing";
};

function Transactions({ type }: Props) {
  const { t } = useTranslation("translation", {
    keyPrefix: "transactions",
  });

  const { account, balancesDecorated, accountLoading } = useAccount();

  const { transactions, isLoadingTransactions, loadTransactions } =
    useTransactions();

  const { isLoadingInvoices, incomingTransactions, loadInvoices } =
    useInvoices();

  const isLoading =
    accountLoading ||
    (type === "incoming" ? isLoadingInvoices : isLoadingTransactions);
  const listItems = type === "incoming" ? incomingTransactions : transactions;

  useEffect(() => {
    if (type === "incoming") {
      loadInvoices();
    } else {
      if (account?.id) loadTransactions(account.id);
    }
  }, [
    type,
    account?.id,
    balancesDecorated?.accountBalance,
    loadTransactions,
    loadInvoices,
  ]);

  return (
    <Container>
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500">
        {t(`description.${type}`)}
      </p>

      {isLoading ? (
        <div className="flex justify-center mt-12">
          <Loading />
        </div>
      ) : (
        <div>
          {listItems && listItems.length > 0 && (
            <TransactionsTable transactions={listItems} />
          )}
        </div>
      )}
    </Container>
  );
}

export default Transactions;
