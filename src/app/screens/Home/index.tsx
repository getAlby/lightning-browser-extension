import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import AllowanceMenu from "@components/AllowanceMenu";
import Button from "@components/Button";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import Progressbar from "@components/Progressbar";
import PublisherCard from "@components/PublisherCard";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect, useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import browser from "webextension-polyfill";
import { useSettings } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";
import lnurlLib from "~/common/lib/lnurl";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";
import type { Allowance, Battery, Transaction } from "~/types";

import DefaultView from "./DefaultView";

dayjs.extend(relativeTime);

function Home() {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFiatValue,
  } = useSettings();

  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [currentUrl, setCurrentUrl] = useState<URL | null>(null);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [loadingAllowance, setLoadingAllowance] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSendSats, setLoadingSendSats] = useState(false);
  const [lnData, setLnData] = useState<Battery[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "home" });

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAllowance(false);
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
        title: payment.name || payment.description,
        publisherLink: allowance
          ? `options.html#/publishers/${payment.id}`
          : "options.html#/publishers",
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
                    const lnurlDetails = await lnurlLib.getDetails(lnurl);
                    if (isLNURLDetailsError(lnurlDetails)) {
                      toast.error(lnurlDetails.reason);
                      return;
                    }

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
      {allowance && renderAllowanceView()}
      {!allowance && !loadingPayments && (
        <DefaultView currentUrl={currentUrl} lnDataFromCurrentTab={lnData} />
      )}
    </div>
  );
}

export default Home;
