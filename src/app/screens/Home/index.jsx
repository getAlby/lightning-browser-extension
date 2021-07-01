import React from "react";
import browser from "webextension-polyfill";

import utils from "../../../common/lib/utils";
import { getFiatFromSatoshi } from "../../../common/utils/helpers";

import Navbar from "../../components/Navbar";
import Transactions from "../../components/Transactions";
import Loading from "../../components/Loading";
import BalanceCard from "../../components/BalanceCard";
import PublisherCard from "../../components/PublisherCard";
import Progressbar from "../../components/Shared/progressbar";

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
    browser.tabs
      .query({ active: true, lastFocusedWindow: true })
      .then((tabs) => {
        const url = new URL(tabs[0].url);
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
        transactions: result?.payments,
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
          <div className="flex justify-between items-center py-3 border-b border-grey-200">
            <dl className="mb-0">
              <dt className="text-sm">Allowance</dt>
              <dd className="mb-0 text-sm text-gray-500">
                {allowance.remainingBudget} / {allowance.totalBudget} sats
              </dd>
            </dl>
            <div className="w-24">
              <Progressbar
                filledColor="blue-bitcoin"
                notFilledColor="blue-200"
                textColor="white"
              />
            </div>
          </div>

          <Transactions
            exchangeRate={this.exchangeRate}
            transactions={allowance.payments.map((payment) => ({
              ...payment,
              creation_date: payment.createdAt,
              value: payment.totalAmount,
            }))}
          />
        </div>
      </>
    );
  }

  renderDefaultView() {
    const { balance, balanceFiat, transactions } = this.state;
    return (
      <>
        <div className="p-5 border-b-4 border-gray-200">
          <BalanceCard
            alias="Wallet name"
            crypto={balance && `₿${balance}`}
            fiat={balanceFiat && `$${balanceFiat}`}
          />
        </div>

        <div className="p-5">
          <h2 className="text-xl">Transactions</h2>
          {this.state.loadingTransactions ? (
            <div className="pt-4 flex justify-center">
              <Loading />
            </div>
          ) : (
            <Transactions
              exchangeRate={this.exchangeRate}
              transactions={transactions}
            />
          )}
        </div>
      </>
    );
  }

  render() {
    const { alias, allowance, balance, balanceFiat } = this.state;

    return (
      <div>
        <Navbar
          title={alias}
          subtitle={`${balance} (${balanceFiat})`}
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
