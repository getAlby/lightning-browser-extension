import React from "react";
import browser from "webextension-polyfill";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import utils from "../../../common/lib/utils";
import { getFiatFromSatoshi } from "../../../common/utils/helpers";

import Navbar from "../../components/Navbar";
import TransactionsTable from "../../components/TransactionsTable";

import Loading from "../../components/Loading";
import PublisherCard from "../../components/PublisherCard";
import Progressbar from "../../components/Shared/progressbar";

dayjs.extend(relativeTime);

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alias: "",
      allowance: null,
      currency: "USD",
      balance: null,
      balanceFiat: null,
      transactions: {},
      loadingTransactions: true,
    };
  }
  get exchangeRate() {
    if (!this.state.balance) return null;
    return (this.state.balanceFiat / this.state.balance) * 100000000;
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

    utils.call("accountInfo").then((response) => {
      this.setState({
        alias: response.info?.alias,
        balance: response.balance?.balance,
      });
      getFiatFromSatoshi(this.state.currency, this.state.balance).then(
        (fiat) => {
          this.setState({ balanceFiat: fiat });
        }
      );
    });
    utils.call("getTransactions").then((result) => {
      console.log(result);
      this.setState({
        transactions: result?.transactions,
        loadingTransactions: false,
      });
    });
  }

  renderAllowanceView() {
    const { allowance } = this.state;
    return (
      <>
        <PublisherCard title={allowance.name} image={allowance.imageURL} />
        <div className="px-5">
          <div className="flex justify-between items-center py-3">
            <dl className="mb-0">
              <dt className="text-sm">Allowance</dt>
              <dd className="mb-0 text-sm text-gray-500">
                {allowance.remainingBudget} / {allowance.totalBudget} sats
              </dd>
            </dl>
            <div className="w-24">
              <Progressbar
                percentage={
                  (allowance.remainingBudget / allowance.totalBudget) * 100
                }
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
                title: payment.description,
                subTitle: (
                  <p>
                    {payment.name} @{" "}
                    <a
                      target="_blank"
                      className="truncate"
                      title={payment.location}
                      href={payment.location}
                      rel="noreferrer"
                    >
                      {payment.location}
                    </a>
                  </p>
                ),
                currency: "€",
                value: 9.99,
              }))}
            />
          )}
        </div>
      </>
    );
  }

  renderDefaultView() {
    const { transactions } = this.state;
    return (
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-3">Transactions</h2>
        {this.state.loadingTransactions ? (
          <div className="pt-4 flex justify-center">
            <Loading />
          </div>
        ) : (
          <TransactionsTable
            transactions={transactions.map((transaction) => ({
              ...transaction,
              type: "sent",
              date: dayjs(transaction.createdAt).fromNow(),
              title: transaction.description,
              subTitle: (
                <p>
                  {transaction.name} @{" "}
                  <a
                    target="_blank"
                    className="truncate"
                    title={transaction.location}
                    href={transaction.location}
                    rel="noreferrer"
                  >
                    {transaction.location}
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
    const { alias, allowance, balance, balanceFiat } = this.state;

    return (
      <div>
        <Navbar
          title={alias}
          subtitle={balance && balanceFiat ? `${balance} (${balanceFiat})` : ""}
          onOptionsClick={() => {
            return utils.openPage("options.html");
          }}
        />
        {allowance ? this.renderAllowanceView() : this.renderDefaultView()}
      </div>
    );
  }
}

export default Home;
