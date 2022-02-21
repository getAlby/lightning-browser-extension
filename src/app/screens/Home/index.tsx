import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  SendIcon,
  ReceiveIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";

import api from "../../../common/lib/api";
import type { Allowance, Battery, Transaction } from "../../../types";

import Button from "../../components/Button";
import TransactionsTable from "../../components/TransactionsTable";
import AllowanceMenu from "../../components/AllowanceMenu";
import Loading from "../../components/Loading";
import PublisherCard from "../../components/PublisherCard";
import Progressbar from "../../components/Progressbar";

dayjs.extend(relativeTime);

function Home() {
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSendSats, setLoadingSendSats] = useState(false);
  const [lnData, setLnData] = useState<Battery[]>([]);
  const navigate = useNavigate();

  function loadAllowance() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const [currentTab] = tabs;
      const url = new URL(currentTab.url as string);
      api.getAllowance(url.host).then((result) => {
        if (result.enabled) {
          setAllowance(result);
        }
      });
    });
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

  function renderAllowanceView() {
    if (!allowance) return;
    return (
      <>
        <PublisherCard title={allowance.name} image={allowance.imageURL} />
        <div className="px-4 pb-5">
          <div className="flex justify-between items-center py-3">
            {+allowance.totalBudget > 0 ? (
              <>
                <dl className="mb-0">
                  <dt className="text-xs text-gray-500 dark:tex-gray-400">
                    Allowance
                  </dt>
                  <dd className="mb-0 text-sm font-medium dark:text-gray-400">
                    {allowance.usedBudget} / {allowance.totalBudget} sat used
                  </dd>
                </dl>
              </>
            ) : (
              <div />
            )}
            <div className="flex items-center">
              {+allowance.totalBudget > 0 && (
                <div className="w-24 mr-4">
                  <Progressbar percentage={allowance.percentage} />
                </div>
              )}
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

  return (
    <div>
      {!allowance && lnData.length > 0 && (
        <PublisherCard
          title={lnData[0].name}
          description={lnData[0].description}
          image={lnData[0].icon}
        >
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
                if (e instanceof Error) alert(e.message);
              } finally {
                setLoadingSendSats(false);
              }
            }}
            label="⚡️ Send Satoshis ⚡️"
            primary
            loading={loadingSendSats}
          />
        </PublisherCard>
      )}
      {allowance ? renderAllowanceView() : renderDefaultView()}
    </div>
  );
}

export default Home;
