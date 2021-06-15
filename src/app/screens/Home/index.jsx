import React from "react";
import browser from "webextension-polyfill";

import utils from "../../../common/lib/utils";
import { getFiatFromSatoshi } from "../../../common/utils/helpers";
import { Avatar, Tooltip } from "antd";
import { PropertySafetyTwoTone, EditOutlined } from "@ant-design/icons";
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
    browser.storage.sync.get(["currentAccount"]).then((result) => {
      this.setState({ currentAccount: result.currentAccount });
    });
    utils.call("getInfo").then((info) => {
      console.log("info", info);
      this.setState({ alias: info?.alias });
    });
    utils.call("getTransactions").then((result) => {
      console.log(result);
      this.setState({
        transactions: result?.payments,
        loadingTransactions: false,
      });
    });
    utils.call("getBalance").then(async (result) => {
      this.setState({ balance: result?.balance });
      this.setState({
        balanceFiat: await getFiatFromSatoshi(
          this.state.currency,
          result.balance
        ),
      });
    });
  }

  render() {
    return (
      <div>
        <div className="px-5 py-2 flex border-b border-gray-100">
          <Avatar size="45" icon={<PropertySafetyTwoTone />} />
          <h2>{this.state.alias}</h2>
          <div className="ml-auto">
            <Tooltip placement="top" title="Edit Account">
              <EditOutlined
                className="account--container__edit"
                onClick={() => {
                  return utils.openPage("options.html");
                }}
              />
            </Tooltip>
          </div>
        </div>
        <div className="p-5 border-b-4 border-gray-200">
          <BalanceCard
            alias="Wallet name"
            crypto={`₿${this.state.balance || ""}`}
            fiat={`$${this.state.balanceFiat || ""}`}
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
              transactions={this.state.transactions}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Home;
