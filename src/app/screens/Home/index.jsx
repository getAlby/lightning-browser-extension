import React from "react";
import { withRouter } from "react-router-dom";
import browser from "webextension-polyfill";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import SendIcon from "@bitcoin-design/bitcoin-icons/svg/filled/send.svg";
import ReceiveIcon from "@bitcoin-design/bitcoin-icons/svg/filled/receive.svg";

import utils from "../../../common/lib/utils";
import lnurl from "../../../common/lib/lnurl";

import Button from "../../components/Button";
import TransactionsTable from "../../components/TransactionsTable";
import AllowanceMenu from "../../components/AllowanceMenu";
import Loading from "../../components/Loading";
import PublisherCard from "../../components/PublisherCard";
import Progressbar from "../../components/Progressbar";

dayjs.extend(relativeTime);

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allowance: null,
      currency: "USD",
      payments: {},
      loadingPayments: true,
      loadingSendSats: false,
      lnData: [],
    };
  }

  loadLightningDataFromCurrentWebsite() {
    // Enhancement data is loaded asynchronously (for example because we need to fetch additional data).
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      browser.tabs
        .sendMessage(tabs[0].id, { type: "lightningData" })
        .then((data) => {
          this.setState({ lnData: data });
        });
    });
  }

  loadAllowance = () => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const [currentTab] = tabs;
      const url = new URL(currentTab.url);
      utils.call("getAllowance", { host: url.host }).then((result) => {
        if (result.enabled) {
          this.setState({ allowance: result });
        }
      });
    });
  };

  loadPayments() {
    utils.call("getPayments").then((result) => {
      this.setState({
        payments: result?.payments,
        loadingPayments: false,
      });
    });
  }

  initialize() {
    this.loadPayments();
    this.loadAllowance();
  }

  componentDidMount() {
    this.initialize();
    this.loadLightningDataFromCurrentWebsite();
  }

  renderAllowanceView() {
    const { allowance } = this.state;
    return (
      <>
        <PublisherCard title={allowance.name} image={allowance.imageURL} />
        <div className="px-4 pb-5">
          <div className="flex justify-between items-center py-3">
            {parseInt(allowance.totalBudget) > 0 ? (
              <>
                <dl className="mb-0">
                  <dt className="text-xs text-gray-500">Allowance</dt>
                  <dd className="mb-0 text-sm font-medium">
                    {allowance.usedBudget} / {allowance.totalBudget} sat used
                  </dd>
                </dl>
              </>
            ) : (
              <div />
            )}
            <div className="flex items-center">
              {parseInt(allowance.totalBudget) > 0 && (
                <div className="w-24 mr-4">
                  <Progressbar percentage={allowance.percentage} />
                </div>
              )}
              <AllowanceMenu
                allowance={allowance}
                onEdit={this.loadAllowance}
                onDelete={() => {
                  this.setState({ allowance: null });
                }}
              />
            </div>
          </div>

          {allowance.payments && (
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
          )}
        </div>
      </>
    );
  }

  renderDefaultView() {
    const { payments } = this.state;
    const { history } = this.props;
    return (
      <div className="p-4">
        <div className="flex mb-6 space-x-4">
          <Button
            fullWidth
            icon={
              <img
                className="w-6 h-6"
                src={SendIcon}
                alt=""
                aria-hidden="true"
              />
            }
            label="Send"
            direction="column"
            onClick={() => {
              history.push("/send");
            }}
          />
          <Button
            fullWidth
            icon={
              <img
                className="w-6 h-6"
                src={ReceiveIcon}
                alt=""
                aria-hidden="true"
              />
            }
            label="Receive"
            direction="column"
            onClick={() => {
              history.push("/receive");
            }}
          />
        </div>

        {this.state.loadingPayments ? (
          <div className="flex justify-center">
            <Loading />
          </div>
        ) : (
          <div>
            <h2 className="mb-2 text-lg text-gray-900 font-semibold">
              Transactions
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
              <p className="text-gray-500">No transactions yet.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  render() {
    const { allowance, lnData, loadingSendSats } = this.state;
    const { history } = this.props;

    return (
      <div>
        {!allowance && lnData.length > 0 && (
          <PublisherCard title={lnData[0].name} image={lnData[0].icon}>
            <Button
              onClick={async () => {
                try {
                  this.setState({ loadingSendSats: true });
                  const details = await lnurl.getDetails(lnData[0].recipient);
                  const origin = {
                    external: true,
                    name: lnData[0].name,
                    host: lnData[0].host,
                    description: lnData[0].description,
                    icon: lnData[0].icon,
                  };
                  history.push("/lnurlPay", {
                    details,
                    origin,
                  });
                } catch (e) {
                  alert(e.message);
                } finally {
                  this.setState({ loadingSendSats: false });
                }
              }}
              label="⚡️ Send Satoshis ⚡️"
              primary
              loading={loadingSendSats}
            />
          </PublisherCard>
        )}
        {allowance ? this.renderAllowanceView() : this.renderDefaultView()}
      </div>
    );
  }
}

export default withRouter(Home);
