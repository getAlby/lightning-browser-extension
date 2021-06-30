import React from "react";
import browser from "webextension-polyfill";

import utils from "../../../common/lib/utils";
import { getFiatFromSatoshi } from "../../../common/utils/helpers";

import Navbar from "../../components/Navbar";
import Transactions from "../../components/Transactions";
import Loading from "../../components/Loading";
import BalanceCard from "../../components/BalanceCard";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alias: "",
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

  render() {
    const { alias, balance, balanceFiat, transactions } = this.state;

    return (
      <div>
        <Navbar
          title={alias}
          subtitle={`${balance} (${balanceFiat})`}
          onOptionsClick={() => {
            return utils.openPage("options.html");
          }}
        />
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
      </div>
    );
  }
}

export default Home;
