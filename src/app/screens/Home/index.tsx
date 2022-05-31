import {
  SendIcon,
  ReceiveIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import AllowanceMenu from "@components/AllowanceMenu";
import Button from "@components/Button";
import Loading from "@components/Loading";
import Progressbar from "@components/Progressbar";
import PublisherCard from "@components/PublisherCard";
import TransactionsTable from "@components/TransactionsTable";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import browser from "webextension-polyfill";
import api from "~/common/lib/api";
import type { Allowance, Battery, Transaction } from "~/types";

dayjs.extend(relativeTime);

function Home() {
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [loadingAllowance, setLoadingAllowance] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSendSats, setLoadingSendSats] = useState(false);
  const [lnData, setLnData] = useState<Battery[]>([]);
  const navigate = useNavigate();

  async function loadAllowance() {
    try {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const [currentTab] = tabs;
      const url = new URL(currentTab.url as string);
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

  function loadPayments() {
    api.getPayments({ limit: 10 }).then((result) => {
      setPayments(result?.payments);
      setLoadingPayments(false);
    });
  }

  function handleLightningDataMessage(response: {
    type: string;
    args: Battery[];
  }) {
    if (response.type === "lightningData") {
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
          type: "extractLightningData",
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
            label="⚡️ Send Satoshis ⚡️"
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
              <dt className="text-xs text-gray-500 dark:tex-gray-400">
                Allowance
              </dt>
              <dd className="flex items-center mb-0 text-sm font-medium dark:text-gray-400">
                {+allowance.totalBudget > 0
                  ? `${allowance.usedBudget} / ${allowance.totalBudget} `
                  : "0 / 0 "}
                sats used
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
          <h2 className="mb-2 text-lg text-gray-900 font-semibold dark:text-white">
            Recent Transactions
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
            <p className="text-gray-500 dark:text-gray-400">
              No transactions on <strong>{allowance.name}</strong> yet.
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
            label="Send"
            direction="column"
            onClick={() => {
              navigate("/send");
            }}
          />
          <Button
            fullWidth
            icon={<ReceiveIcon className="w-6 h-6" />}
            label="Receive"
            direction="column"
            onClick={() => {
              navigate("/receive");
            }}
          />
        </div>

        {loadingPayments ? (
          <div className="flex justify-center">
            <Loading />
          </div>
        ) : (
          <div>
            <h2 className="mb-2 text-lg text-gray-900 font-semibold dark:text-white">
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
              <p className="text-gray-500 dark:text-gray-400">
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
    <div>
      {renderPublisherCard()}
      {allowance ? renderAllowanceView() : renderDefaultView()}
    </div>
  );
}

export default Home;
