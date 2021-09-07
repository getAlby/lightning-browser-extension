import React from "react";
import browser from "webextension-polyfill";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import utils from "../../../common/lib/utils";

import TransactionsTable from "../../components/TransactionsTable";

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
    };
  }

  componentDidMount() {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const [currentTab] = tabs;
      const url = new URL(currentTab.url);
      utils.call("getAllowance", { host: url.host }).then((result) => {
        if (result.enabled) {
          this.setState({ allowance: result });
        }
      });
    });

    utils.call("getPayments").then((result) => {
      this.setState({
        payments: result?.payments,
        loadingPayments: false,
      });
    });
  }

  renderAllowanceView() {
    const { allowance } = this.state;
    return (
      <>
        <PublisherCard title={allowance.name} image={allowance.imageURL} />
        <div className="px-5 pb-5">
          {parseInt(allowance.totalBudget) > 0 ? (
            <div className="flex justify-between items-center py-3">
              <dl className="mb-0">
                <dt className="text-sm">Allowance</dt>
                <dd className="mb-0 text-sm text-gray-500">
                  {allowance.usedBudget} / {allowance.totalBudget} Sats
                </dd>
              </dl>
              <div className="w-24">
                <Progressbar percentage={allowance.percentage} />
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center py-3"></div>
          )}

          {allowance.payments && (
            <TransactionsTable
              transactions={allowance.payments.map((payment) => ({
                ...payment,
                type: "sent",
                date: dayjs(payment.createdAt).fromNow(),
                // date: dayjs.unix(payment.createdAt),
                title: (
                  <p>
                    <a
                      target="_blank"
                      title={payment.name}
                      href={`options.html#/publishers`}
                      rel="noreferrer"
                    >
                      {payment.description}
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
          )}
        </div>
      </>
    );
  }

  renderDefaultView() {
    const { payments } = this.state;
    return (
      <div className="p-5">
        <hr></hr>
        {this.state.loadingPayments ? (
          <div className="pt-4 flex justify-center">
            <Loading />
          </div>
        ) : (
          <TransactionsTable
            transactions={payments.map((payment) => ({
              ...payment,
              type: "sent",
              date: dayjs(payment.createdAt).fromNow(),
              title: (
                <p>
                  <a
                    target="_blank"
                    title={payment.name}
                    href={`options.html#/publishers`}
                    rel="noreferrer"
                  >
                    {payment.description}
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
        )}
      </div>
    );
  }

  render() {
    const { allowance } = this.state;

    if (allowance) {
      return this.renderAllowanceView();
    }

    return this.renderDefaultView();
  }
}

export default Home;
