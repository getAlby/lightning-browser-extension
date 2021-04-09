import React from "react";
import browser from "webextension-polyfill";

import utils from "../../../common/lib/utils";
import { getFiatFromSatoshi } from "../../../common/utils/helpers";
import { Avatar, Empty, Divider, Tooltip } from "antd";
import { PropertySafetyTwoTone, EditOutlined } from "@ant-design/icons";
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
          <div class="account--container__name d-flex">
            <Avatar size="45" icon={<PropertySafetyTwoTone />} />
            <h2>{this.state.alias}</h2>
            <Tooltip placement="topRight" title="Edit Account">
              <EditOutlined
                className="account--container__edit"
                onClick={() => {
                  return utils.openPage("options.html");
                }}
              />
            </Tooltip>
          </div>
          <h1>{this.state.balance} Satoshi</h1>
          <h3>
            {this.state.balanceFiat} {this.state.currency}
          </h3>
        </div>
        <Divider />
        <div>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </div>
    );
  }
}

export default Home;
