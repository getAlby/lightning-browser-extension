import {
  CaretLeftIcon,
  SendIcon,
  ReceiveIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import AllowanceMenu from "@components/AllowanceMenu";
import Button from "@components/Button";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import Loading from "@components/Loading";
import Progressbar from "@components/Progressbar";
import PublisherCard from "@components/PublisherCard";
import TransactionsTable from "@components/TransactionsTable";
import { Tab } from "@headlessui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect, useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import browser from "webextension-polyfill";
import { useSettings } from "~/app/context/SettingsContext";
import { classNames } from "~/app/utils/index";
import api from "~/common/lib/api";
import lnurlLib from "~/common/lib/lnurl";
import utils from "~/common/lib/utils";
import type { Allowance, Battery, Transaction } from "~/types";

dayjs.extend(relativeTime);

function Home() {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFiatValue,
  } = useSettings();

  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<URL | null>(null);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [incomingTransactions, setIncomingTransactions] = useState<
    Transaction[] | null
  >(null);
  const [loadingAllowance, setLoadingAllowance] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSendSats, setLoadingSendSats] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [lnData, setLnData] = useState<Battery[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "home" });
  const { t: tCommon } = useTranslation("common");

  async function loadAllowance() {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const [currentTab] = tabs;
      const url = new URL(currentTab.url as string);
      setCurrentUrl(url);
      const result = await api.getAllowance(url.host);
      if (result.enabled) {
        setAllowance(result);
      }
      const blocklistResult = await api.getBlocklist(url.host);
      if (blocklistResult.blocked) {
        setIsBlocked(blocklistResult.blocked);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAllowance(false);
    }
  }

  async function unblock() {
    try {
      if (currentUrl?.host) {
        await utils.call("deleteBlocklist", {
          host: currentUrl.host,
        });
      }
      setIsBlocked(false);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  }

  const loadPayments = useCallback(async () => {
    try {
      let tmpPayments;

      if (allowance) {
        tmpPayments = allowance.payments;
      } else {
        const { payments: dbPayments } = await api.getPayments({ limit: 10 });
        tmpPayments = dbPayments;
      }

      const payments: Transaction[] = tmpPayments.map((payment) => ({
        ...payment,
        id: `${payment.id}`,
        type: "sent",
        date: dayjs(payment.createdAt).fromNow(),
        title: (
          <p className="truncate">
            <a
              target="_blank"
              href={
                allowance
                  ? `options.html#/publishers/${allowance.id}`
                  : `options.html#/publishers`
              }
              rel="noreferrer"
            >
              {/* 
                TODO: https://github.com/getAlby/lightning-browser-extension/issues/1356
                Refactor: use virtual attribute on payment for title
              */}
              {payment.name || payment.description}
            </a>
          </p>
        ),
      }));

      for await (const payment of payments) {
        const totalAmountFiat = settings.showFiat
          ? await getFiatValue(payment.totalAmount)
          : "";
        payment.totalAmountFiat = totalAmountFiat;
      }

      setPayments(payments);
      setLoadingPayments(false);
    } catch (e) {
      console.error(e);
    }
  }, [allowance, settings.showFiat, getFiatValue]);

  function handleLightningDataMessage(response: {
    action: string;
    args: Battery[];
  }) {
    if (response.action === "lightningData") {
      setLnData(response.args);
    }
  }

  async function onTabChangeHandler(index: number) {
    if (index === 1) {
      await loadInvoices();
    }
  }

  async function loadInvoices() {
    // incoives have already been loaded
    if (incomingTransactions) return incomingTransactions;

    setLoadingInvoices(true);
    const result = await api.getInvoices({ isSettled: true });

    const invoices: Transaction[] = result.invoices.map((invoice) => ({
      ...invoice,
      title: invoice.memo,
      description: invoice.memo,
      date: dayjs(invoice.settleDate).fromNow(),
    }));

    for (const invoice of invoices) {
      const totalAmountFiat = settings.showFiat
        ? await getFiatValue(invoice.totalAmount)
        : "";
      invoice.totalAmountFiat = totalAmountFiat;
    }

    setIncomingTransactions(invoices);
    setLoadingInvoices(false);
  }

  // Effects on Mount
  useEffect(() => {
    loadAllowance();

    // Enhancement data is loaded asynchronously (for example because we need to fetch additional data).
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length > 0 && tabs[0].url?.startsWith("http")) {
        browser.tabs.sendMessage(tabs[0].id as number, {
          action: "extractLightningData",
        });
      }
    });
    browser.runtime.onMessage.addListener(handleLightningDataMessage);

    return () => {
      browser.runtime.onMessage.removeListener(handleLightningDataMessage);
    };
  }, []);

  useEffect(() => {
    if (!isLoadingSettings && !loadingAllowance) {
      loadPayments();
    }
  }, [isLoadingSettings, loadingAllowance, loadPayments]);

  function renderPublisherCard() {
    let title, image;
    if (allowance) {
      title = allowance.name;
      image = allowance.imageURL;
    } else if (lnData.length > 0) {
      title = lnData[0].name;
      image = lnData[0].icon;
    } else {
      return;
    }

    return (
      <div
        className={
          lnData.length > 0
            ? "border-b border-gray-200 dark:border-neutral-500"
            : "mx-4"
        }
      >
        <PublisherCard
          title={title}
          description={lnData.length > 0 ? lnData[0].description : ""}
          image={image}
          isCard={!(lnData.length > 0)}
          isSmall={false}
        >
          {lnData.length > 0 && (
            <Button
              onClick={async () => {
                try {
                  setLoadingSendSats(true);

                  const originData = {
                    external: true,
                    name: lnData[0].name,
                    host: lnData[0].host,
                    description: lnData[0].description,
                    icon: lnData[0].icon,
                  };

                  if (lnData[0].method === "lnurl") {
                    const lnurl = lnData[0].address;
                    const lnurlDetails = await lnurlLib.getDetails(lnurl); // throws if invalid.

                    if (lnurlDetails.tag === "payRequest") {
                      navigate("/lnurlPay", {
                        state: {
                          origin: originData,
                          args: {
                            lnurlDetails,
                          },
                        },
                      });
                    }
                  } else if (lnData[0].method === "keysend") {
                    navigate("/keysend", {
                      state: {
                        origin: originData,
                        args: {
                          destination: lnData[0].address,
                          customRecords:
                            lnData[0].customKey && lnData[0].customValue
                              ? {
                                  [lnData[0].customKey]: lnData[0].customValue,
                                }
                              : {},
                        },
                      },
                    });
                  }
                } catch (e) {
                  if (e instanceof Error) toast.error(e.message);
                } finally {
                  setLoadingSendSats(false);
                }
              }}
              label={t("actions.send_satoshis")}
              primary
              loading={loadingSendSats}
            />
          )}
        </PublisherCard>
      </div>
    );
  }

  function renderAllowanceView() {
    if (!allowance) return;
    return (
      <>
        <div className="px-4 pb-5">
          <div className="flex justify-between items-center py-3">
            <dl className="mb-0">
              <dt className="text-xs text-gray-500 dark:text-neutral-400">
                {t("allowance_view.allowance")}
              </dt>
              <dd className="flex items-center mb-0 text-sm font-medium dark:text-neutral-400">
                {+allowance.totalBudget > 0
                  ? `${allowance.usedBudget} / ${allowance.totalBudget} `
                  : "0 / 0 "}
                {t("allowance_view.sats_used")}
                <div className="ml-3 w-24">
                  <Progressbar percentage={allowance.percentage} />
                </div>
              </dd>
            </dl>
            <div className="flex items-center">
              <AllowanceMenu
                allowance={allowance}
                onEdit={loadAllowance}
                onDelete={() => {
                  setAllowance(null);
                }}
              />
            </div>
          </div>

          <h2 className="mb-2 text-lg text-gray-900 font-bold dark:text-white">
            {t("allowance_view.recent_transactions")}
          </h2>

          {payments.length > 0 ? (
            <TransactionsTable transactions={payments} />
          ) : (
            <p className="text-gray-500 dark:text-neutral-400">
              <Trans
                i18nKey={"allowance_view.no_transactions"}
                t={t}
                values={{ name: allowance.name }}
                // eslint-disable-next-line react/jsx-key
                components={[<strong></strong>]}
              />
            </p>
          )}
        </div>
      </>
    );
  }

  function renderDefaultView() {
    return (
      <div className="p-4">
        <div className="flex mb-6 space-x-4">
          <Button
            fullWidth
            icon={<SendIcon className="w-6 h-6" />}
            label={tCommon("actions.send")}
            direction="column"
            onClick={() => {
              navigate("/send");
            }}
          />
          <Button
            fullWidth
            icon={<ReceiveIcon className="w-6 h-6" />}
            label={tCommon("actions.receive")}
            direction="column"
            onClick={() => {
              navigate("/receive");
            }}
          />
        </div>

        {isBlocked && (
          <div className="mb-2 items-center py-3 dark:text-white">
            <p className="py-1">
              {t("default_view.is_blocked_hint", { host: currentUrl?.host })}
            </p>
            <Button
              fullWidth
              label={t("actions.enable_now")}
              direction="column"
              onClick={() => unblock()}
            />
          </div>
        )}

        {loadingPayments ? (
          <div className="flex justify-center">
            <Loading />
          </div>
        ) : (
          <div>
            <h2 className="mb-2 text-lg text-gray-900 font-bold dark:text-white">
              {t("default_view.recent_transactions")}
            </h2>

            <Tab.Group onChange={onTabChangeHandler}>
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
                  {payments.length > 0 ? (
                    <TransactionsTable transactions={payments} />
                  ) : (
                    <p className="text-gray-500 dark:text-neutral-400">
                      {t("default_view.no_transactions")}
                    </p>
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {loadingInvoices ? (
                    <div className="flex justify-center">
                      <Loading />
                    </div>
                  ) : incomingTransactions &&
                    incomingTransactions.length > 0 ? (
                    <TransactionsTable transactions={incomingTransactions} />
                  ) : (
                    <p className="text-gray-500 dark:text-neutral-400">
                      {t("default_view.no_transactions")}
                    </p>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </div>
    );
  }

  if (loadingAllowance) {
    return null;
  }

  return (
    <div className="overflow-y-auto no-scrollbar h-full">
      {allowance && (
        <Header
          title={allowance.host}
          headerLeft={
            <IconButton
              onClick={() => setAllowance(null)}
              icon={<CaretLeftIcon className="w-4 h-4" />}
            />
          }
        />
      )}
      {renderPublisherCard()}
      {allowance ? renderAllowanceView() : renderDefaultView()}
    </div>
  );
}

export default Home;
