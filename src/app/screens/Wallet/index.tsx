import {
  ReceiveIcon,
  SendIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import BalanceBox from "@components/BalanceBox";
import Button from "@components/Button";
import Container from "@components/Container";
import Hyperlink from "@components/Hyperlink";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import { Tab } from "@headlessui/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";
import { useInvoices } from "~/app/hooks/useInvoices";
import { useTransactions } from "~/app/hooks/useTransactions";
import { classNames } from "~/app/utils";

function Wallet() {
  const { t } = useTranslation("translation", { keyPrefix: "wallet" });
  const { t: tCommon } = useTranslation("common");
  const { t: tComponents } = useTranslation("components");

  const navigate = useNavigate();

  const { account, balancesDecorated } = useAccount();

  const { transactions, isLoadingTransactions, loadTransactions } =
    useTransactions();

  const { isLoadingInvoices, incomingTransactions, loadInvoices } =
    useInvoices();

  const hasTransactions = !isLoadingTransactions && !!transactions?.length;
  const hasInvoices = !isLoadingInvoices && !!incomingTransactions?.length;

  useEffect(() => {
    if (account?.id) loadTransactions(account.id, 5);
  }, [account?.id, balancesDecorated?.accountBalance, loadTransactions]);

  useEffect(() => {
    loadInvoices(5);
  }, [account?.id, balancesDecorated?.accountBalance, loadInvoices]);

  return (
    <Container>
      <h2 className="mt-12 mb-2 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>

      <div className="mb-2">
        <BalanceBox className="h-28 grow"></BalanceBox>
      </div>
      <div className="flex mb-12 space-x-4">
        <Button
          fullWidth
          icon={<SendIcon className="h-6" />}
          className="h-28 grow text-xl"
          label={tCommon("actions.send")}
          direction="column"
          onClick={() => {
            navigate("/send");
          }}
        />

        <Button
          fullWidth
          icon={<ReceiveIcon className="h-6" />}
          className="h-28 grow text-xl"
          label={tCommon("actions.receive")}
          direction="column"
          onClick={() => {
            navigate("/receive");
          }}
        />
      </div>

      <h4 className="mb-2 text-xl font-bold dark:text-white">
        {t("recent_transactions")}
      </h4>

      {isLoadingTransactions && (
        <div className="flex justify-center">
          <Loading />
        </div>
      )}

      {!isLoadingTransactions && (
        <>
          <Tab.Group>
            <Tab.List className="mb-2">
              {[
                tComponents("transaction_list.tabs.outgoing"),
                tComponents("transaction_list.tabs.incoming"),
              ].map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    classNames(
                      "w-1/2 rounded-lg py-2.5 font-bold transition duration-150",
                      "focus:outline-none",
                      "hover:bg-gray-50 dark:hover:bg-surface-16dp",
                      selected
                        ? "text-orange-bitcoin"
                        : "text-gray-700  dark:text-neutral-200"
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel>
                {hasTransactions && (
                  <>
                    <TransactionsTable transactions={transactions} />
                    <div className="mt-8 text-center">
                      <Hyperlink
                        onClick={() => {
                          navigate("/transactions/outgoing");
                        }}
                      >
                        {t("all_transactions_link")}
                      </Hyperlink>
                    </div>
                  </>
                )}
                {!hasTransactions && (
                  <p className="text-gray-500 dark:text-neutral-400 text-center mt-6">
                    {t("no_outgoing_transactions")}
                  </p>
                )}
              </Tab.Panel>
              <Tab.Panel>
                {isLoadingInvoices && (
                  <div className="flex justify-center">
                    <Loading />
                  </div>
                )}
                {hasInvoices && (
                  <>
                    <TransactionsTable transactions={incomingTransactions} />
                    <div className="mt-8 text-center">
                      <Hyperlink
                        onClick={() => {
                          navigate("/transactions/incoming");
                        }}
                      >
                        {t("all_transactions_link")}
                      </Hyperlink>
                    </div>
                  </>
                )}
                {!hasInvoices && (
                  <p className="text-gray-500 dark:text-neutral-400 text-center mt-6">
                    {t("no_incoming_transactions")}
                  </p>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </>
      )}
    </Container>
  );
}

export default Wallet;
