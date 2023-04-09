import {
  ReceiveIcon,
  SendIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Container from "@components/Container";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import { Tab } from "@headlessui/react";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils";
import { convertPaymentsToTransactions } from "~/app/utils/payments";
import api from "~/common/lib/api";
import { Transaction } from "~/types";

function Wallet() {
  const { t } = useTranslation("translation", { keyPrefix: "wallet" });
  const { t: tCommon } = useTranslation("common");
  const { t: tComponents } = useTranslation("components");

  const navigate = useNavigate();

  const { settings, getFormattedFiat } = useSettings();
  const { account, balancesDecorated } = useAccount();

  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [incomingTransactions, setIncomingTransactions] = useState<
    Transaction[] | null
  >(null);

  const hasTransactions = !isLoadingTransactions && !!transactions?.length;
  const hasInvoices = !isLoadingInvoices && !!incomingTransactions?.length;

  const loadTransactions = useCallback(async () => {
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
      setIsLoadingTransactions(false);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }, [settings, getFormattedFiat]);

  useEffect(() => {
    loadTransactions();
  }, [account?.id, balancesDecorated?.accountBalance, loadTransactions]);

  const loadInvoices = useCallback(async () => {
    setIsLoadingInvoices(true);
    let result;
    try {
      result = await api.getInvoices({ isSettled: true });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
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
  }, [getFormattedFiat, settings.showFiat]);

  useEffect(() => {
    loadInvoices();
  }, [account?.id, balancesDecorated?.accountBalance, loadInvoices]);

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>

      <div className="flex mb-10 space-x-4">
        <Button
          fullWidth
          icon={<SendIcon className="h-6" />}
          className="h-28 grow"
          label={tCommon("actions.send")}
          direction="column"
          onClick={() => {
            navigate("/send");
          }}
        />

        <div className="h-28 grow w-full text-center">balance</div>

        <Button
          fullWidth
          icon={<ReceiveIcon className="h-6" />}
          className="h-28 grow"
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
        <div>
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
                  <TransactionsTable transactions={transactions} />
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
                  <TransactionsTable transactions={incomingTransactions} />
                )}
                {!hasInvoices && (
                  <p className="text-gray-500 dark:text-neutral-400 text-center">
                    {t("no_incoming_transactions")}
                  </p>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </Container>
  );
}

export default Wallet;
