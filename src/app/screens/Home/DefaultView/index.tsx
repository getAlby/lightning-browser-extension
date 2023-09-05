import {
  ReceiveIcon,
  SendIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Hyperlink from "@components/Hyperlink";
import Loading from "@components/Loading";
import Tab from "@components/Tab";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BalanceBox from "~/app/components/BalanceBox";
import { useAccount } from "~/app/context/AccountContext";
import { useInvoices } from "~/app/hooks/useInvoices";
import { useTransactions } from "~/app/hooks/useTransactions";
import { PublisherLnData } from "~/app/screens/Home/PublisherLnData";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { Battery } from "~/types";

dayjs.extend(relativeTime);

export type Props = {
  lnDataFromCurrentTab?: Battery[];
  currentUrl?: URL | null;
  renderPublisherWidget?: boolean;
};

const DefaultView: FC<Props> = (props) => {
  const { t } = useTranslation("translation", { keyPrefix: "home" });
  const { t: tCommon } = useTranslation("common");
  const { t: tComponents } = useTranslation("components");

  const navigate = useNavigate();

  const { account, balancesDecorated, accountLoading } = useAccount();

  const [isBlockedUrl, setIsBlockedUrl] = useState<boolean>(false);

  const { transactions, isLoadingTransactions, loadTransactions } =
    useTransactions();

  const { isLoadingInvoices, incomingTransactions, loadInvoices } =
    useInvoices();

  const isLoadingOutgoing = accountLoading || isLoadingTransactions;
  const isLoadingIncoming = accountLoading || isLoadingInvoices;

  const itemsLimit = 8;

  useEffect(() => {
    if (account?.id) loadTransactions(account.id, itemsLimit);
  }, [
    account?.id,
    balancesDecorated?.accountBalance,
    loadTransactions,
    itemsLimit,
  ]);

  useEffect(() => {
    loadInvoices(itemsLimit);
  }, [
    account?.id,
    balancesDecorated?.accountBalance,
    loadInvoices,
    itemsLimit,
  ]);

  // check if currentURL is blocked
  useEffect(() => {
    const checkBlockedUrl = async (host: string) => {
      const { blocked } = await api.getBlocklist(host);
      setIsBlockedUrl(blocked);
    };

    if (props.currentUrl?.host) {
      checkBlockedUrl(props.currentUrl.host);
    }
  }, [props.currentUrl]);

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

  function handleViewAllLink(path: string) {
    // if we are in the popup
    if (window.location.pathname !== "/options.html") {
      utils.openPage(`options.html#${path}`);
    } else {
      navigate(path);
    }
  }

  return (
    <div className="w-full max-w-screen-sm h-full mx-auto overflow-y-auto no-scrollbar">
      {props.renderPublisherWidget && !!props.lnDataFromCurrentTab?.length && (
        <PublisherLnData lnData={props.lnDataFromCurrentTab[0]} />
      )}
      <div className="p-4">
        <div className="flex space-x-4 mb-4">
          <BalanceBox />
        </div>
        <div className="flex mb-6 lg:mb-12 space-x-4">
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
            <h2 className="mb-2 text-lg lg:text-xl text-gray-900 font-bold dark:text-white">
              {t("default_view.recent_transactions")}
            </h2>

            <Tab.Group>
              <Tab.List>
                {[
                  tComponents("transaction_list.tabs.outgoing"),
                  tComponents("transaction_list.tabs.incoming"),
                ].map((category) => (
                  <Tab key={category} label={category} />
                ))}
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel>
                  <>
                    <TransactionsTable
                      transactions={transactions}
                      loading={isLoadingOutgoing}
                      noResultMsg={t("default_view.no_outgoing_transactions")}
                    />
                    {!isLoadingOutgoing && transactions.length > 0 && (
                      <div className="mt-5 text-center">
                        <Hyperlink
                          onClick={() =>
                            handleViewAllLink("/transactions/outgoing")
                          }
                        >
                          {t("default_view.all_transactions_link")}
                        </Hyperlink>
                      </div>
                    )}
                  </>
                </Tab.Panel>
                <Tab.Panel>
                  <>
                    <TransactionsTable
                      transactions={incomingTransactions}
                      loading={isLoadingIncoming}
                      noResultMsg={t("default_view.no_incoming_transactions")}
                    />
                    {!isLoadingIncoming && incomingTransactions.length > 0 && (
                      <div className="mt-5 text-center">
                        <Hyperlink
                          onClick={() =>
                            handleViewAllLink("/transactions/incoming")
                          }
                        >
                          {t("default_view.all_transactions_link")}
                        </Hyperlink>
                      </div>
                    )}
                  </>
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
