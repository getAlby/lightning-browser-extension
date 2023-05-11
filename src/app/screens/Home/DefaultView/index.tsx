import {
  ReceiveIcon,
  SendIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import { Tab } from "@headlessui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BalanceBox from "~/app/components/BalanceBox";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { PublisherLnData } from "~/app/screens/Home/PublisherLnData";
import { classNames } from "~/app/utils/index";
import { convertPaymentsToTransactions } from "~/app/utils/payments";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { Battery, Transaction } from "~/types";

dayjs.extend(relativeTime);

export type Props = {
  lnDataFromCurrentTab?: Battery[];
  currentUrl: URL | null;
};

const DefaultView: FC<Props> = (props) => {
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [incomingTransactions, setIncomingTransactions] = useState<
    Transaction[] | null
  >(null);

  const [isBlockedUrl, setIsBlockedUrl] = useState<boolean>(false);

  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
  } = useSettings();

  const showFiat = !isLoadingSettings && settings.showFiat;
  const hasTransactions = !isLoadingTransactions && !!transactions?.length;
  const hasInvoices = !isLoadingInvoices && !!incomingTransactions?.length;

  const navigate = useNavigate();
  const { account, balancesDecorated } = useAccount();

  const { t } = useTranslation("translation", { keyPrefix: "home" });
  const { t: tCommon } = useTranslation("common");

  // check if currentURL is blocked
  useEffect(() => {
    const checkBlockedUrl = async () => {
      if (!props.currentUrl) return;

      const blocklistResult = await api.getBlocklist(props.currentUrl.host);
      if (blocklistResult.blocked) {
        setIsBlockedUrl(blocklistResult.blocked);
      }
    };

    checkBlockedUrl();
  }, [props.currentUrl]);

  // get array of transactions if not done yet
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const { payments } = await api.getPayments({ limit: 10 });
        const transactions: Transaction[] = await convertPaymentsToTransactions(
          payments,
          "options.html#/publishers"
        );
        // attach fiatAmount if enabled
        for (const transaction of transactions) {
          transaction.totalAmountFiat = showFiat
            ? await getFormattedFiat(transaction.totalAmount)
            : "";
        }

        setTransactions(transactions);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(e.message);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    !transactions && !isLoadingSettings && getTransactions();
  }, [isLoadingSettings, transactions, getFormattedFiat, showFiat]);

  const unblock = async () => {
    try {
      if (props.currentUrl?.host) {
        await msg.request("deleteBlocklist", {
          host: props.currentUrl.host,
        });
        toast.info(
          t("default_view.block_removed", { host: props.currentUrl.host })
        );
      }
      setIsBlockedUrl(false);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  };

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
      date: invoice.settleDate ? dayjs(invoice.settleDate).fromNow() : "",
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
    const load = async () => {
      await loadInvoices();
    };
    load();
  }, [account?.id, balancesDecorated?.accountBalance, loadInvoices]);

  return (
    <div className="overflow-y-auto no-scrollbar h-full">
      {!!props.lnDataFromCurrentTab?.length && (
        <PublisherLnData lnData={props.lnDataFromCurrentTab[0]} />
      )}
      <div className="p-4">
        <div className="flex space-x-4 mb-4">
          <BalanceBox />
        </div>
        <div className="flex mb-6 space-x-4">
          <Button
            fullWidth
            icon={<ReceiveIcon className="w-6 h-6" />}
            label={tCommon("actions.receive")}
            direction="column"
            onClick={() => {
              navigate("/receive");
            }}
          />

          <Button
            fullWidth
            icon={<SendIcon className="w-6 h-6" />}
            label={tCommon("actions.send")}
            direction="column"
            onClick={() => {
              navigate("/send");
            }}
          />
        </div>

        {isBlockedUrl && (
          <div className="mb-2 items-center py-3 dark:text-white">
            <p className="py-1">
              {t("default_view.is_blocked_hint", {
                host: props.currentUrl?.host,
              })}
            </p>
            <Button
              fullWidth
              label={t("actions.enable_now")}
              direction="column"
              onClick={() => unblock()}
            />
          </div>
        )}

        {isLoadingTransactions && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}

        {!isLoadingTransactions && (
          <div>
            <h2 className="mb-2 text-lg text-gray-900 font-bold dark:text-white">
              {t("default_view.recent_transactions")}
            </h2>

            <Tab.Group>
              <Tab.List className="mb-2">
                {[
                  t("transaction_list.tabs.outgoing"),
                  t("transaction_list.tabs.incoming"),
                ].map((category) => (
                  <Tab
                    key={category}
                    className={({ selected }) =>
                      classNames(
                        "w-1/2 rounded-lg py-2.5 font-bold transition duration-150",
                        "focus:outline-none",
                        "hover:text-gray-600 dark:hover:text-gray-300",
                        selected
                          ? "text-black dark:text-white"
                          : "text-gray-400"
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
                  {!isLoadingTransactions && !transactions?.length && (
                    <p className="text-sm text-center text-gray-500 dark:text-neutral-400">
                      {t("default_view.no_transactions_out")}
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
                  {!isLoadingInvoices && !hasInvoices && (
                    <p className="text-sm text-center text-gray-500 dark:text-neutral-400">
                      {t("default_view.no_transactions_in")}
                    </p>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultView;
