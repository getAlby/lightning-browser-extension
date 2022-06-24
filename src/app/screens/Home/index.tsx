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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import browser from "webextension-polyfill";
import api from "~/common/lib/api";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import type { Allowance, Battery, Transaction } from "~/types";

dayjs.extend(relativeTime);

function Home() {
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<URL | null>(null);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [loadingAllowance, setLoadingAllowance] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSendSats, setLoadingSendSats] = useState(false);
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
    }
  }

  async function loadPayments() {
    const result = await api.getPayments({ limit: 10 });
    for await (const payment of result.payments) {
      const totalAmountFiat = await getFiatValue(payment.totalAmount);
      payment.totalAmountFiat = totalAmountFiat;
    }
    setPayments(result?.payments);
    setLoadingPayments(false);
  }

  function handleLightningDataMessage(response: {
    action: string;
    args: Battery[];
  }) {
    if (response.action === "lightningData") {
      setLnData(response.args);
    }
  }

  useEffect(() => {
    loadPayments();
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

  function renderPublisherCard() {
    let title, description, image;
    if (allowance) {
      title = allowance.name;
      image = allowance.imageURL;
    } else if (lnData.length > 0) {
      title = lnData[0].name;
      description = lnData[0].description;
      image = lnData[0].icon;
    } else {
      return;
    }
    return (
      <PublisherCard title={title} description={description} image={image}>
        {lnData.length > 0 && (
          <Button
            onClick={async () => {
              try {
                setLoadingSendSats(true);
                const origin = {
                  external: true,
                  name: lnData[0].name,
                  host: lnData[0].host,
                  description: lnData[0].description,
                  icon: lnData[0].icon,
                };
                navigate(
                  `/lnurlPay?lnurl=${
                    lnData[0].recipient
                  }&origin=${encodeURIComponent(JSON.stringify(origin))}`
                );
              } catch (e) {
                if (e instanceof Error) toast.error(e.message);
              } finally {
                setLoadingSendSats(false);
              }
            }}
            label={t("send_satoshis")}
            primary
            loading={loadingSendSats}
          />
        )}
      </PublisherCard>
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
            {t("recent_transactions")}
          </h2>
          {allowance?.payments.length > 0 ? (
            <TransactionsTable
              transactions={allowance.payments.map((payment) => ({
                ...payment,
                type: "sent",
                date: dayjs(payment.createdAt).fromNow(),
                // date: dayjs.unix(payment.createdAt),
                title: (
                  <p className="truncate">
                    <a
                      target="_blank"
                      title={payment.name}
                      href={`options.html#/publishers/${allowance.id}`}
                      rel="noreferrer"
                    >
                      {payment.name}
                    </a>
                  </p>
                ),
                subTitle: (
                  <p className="truncate">
                    <a
                      target="_blank"
                      title={payment.name}
                      href={`options.html#/publishers/${allowance.id}`}
                      rel="noreferrer"
                    >
                      {payment.host}
                    </a>
                  </p>
                ),
              }))}
            />
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
              Alby is currently disabled on {currentUrl?.host}
            </p>
            <Button
              fullWidth
              label="Enable now"
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
              Recent Transactions
            </h2>
            {payments.length > 0 ? (
              <TransactionsTable
                transactions={payments.map((payment) => ({
                  ...payment,
                  type: "sent",
                  date: dayjs(payment.createdAt).fromNow(),
                  title: (
                    <p className="truncate">
                      <a
                        target="_blank"
                        title={payment.name}
                        href={`options.html#/publishers`}
                        rel="noreferrer"
                      >
                        {payment.name}
                      </a>
                    </p>
                  ),
                  subTitle: (
                    <p className="truncate">
                      <a
                        target="_blank"
                        title={payment.name}
                        href={`options.html#/publishers`}
                        rel="noreferrer"
                      >
                        {payment.host}
                      </a>
                    </p>
                  ),
                }))}
              />
            ) : (
              <p className="text-gray-500 dark:text-neutral-400">
                No transactions yet.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (loadingAllowance) {
    return null;
  }

  return (
    <div className="overflow-y-auto no-scrollbar">
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
