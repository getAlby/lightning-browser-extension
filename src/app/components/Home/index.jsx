import React from "react";
import browser from "webextension-polyfill";

import utils from "../../../common/lib/utils";
import { getFiatFromSatoshi } from "../../../common/utils/helpers";
import { Avatar } from "antd";
import { PropertySafetyTwoTone } from "@ant-design/icons";
import "./styles.scss";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alias: "",
      currency: "USD",
      balanceFiat: null,
    };
  }

  componentDidMount() {
    browser.storage.sync.get(["currentAccount"]).then((result) => {
      this.setState({ currentAccount: result.currentAccount });
    });
    utils.call("getInfo").then((info) => {
      console.log(info);
      this.setState({ alias: info.alias });
    });
    utils.call("getBalance").then(async (result) => {
      this.setState({ balance: result.balance });
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
      <div class="account--container">
        <div class="account--container__upper">
          <Avatar
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
            icon={<PropertySafetyTwoTone />}
          />
          {this.state.currentAccount}
          <h2>{this.state.alias}</h2>
          <h1>{this.state.balance} Satoshi</h1>
          <h3>
            {this.state.balanceFiat} {this.state.currency}
          </h3>
          <button
            id="options__button"
            type="button"
            onClick={() => {
              return utils.openPage("options.html");
            }}
          >
            Options Page
          </button>
          <button
            type="button"
            onClick={() => {
              return utils.openPage("welcome.html");
            }}
          >
            Welcome
          </button>
        </div>
      </div>
    );
  }
}

export default Home;
