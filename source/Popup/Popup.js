import React from "react";
import browser from "webextension-polyfill";
import utils from "../lib/utils";

import "./styles.scss";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alias: "",
    };
  }

  componentDidMount() {
    utils.call("isUnlocked").then((unlocked) => {
      this.setState({ unlocked: unlocked ? "yes" : "no" });
    });
    browser.storage.sync.get(["currentAccount"]).then((result) => {
      this.setState({ currentAccount: result.currentAccount });
    });
    utils.call("getInfo").then((info) => {
      this.setState({ alias: info.data.alias });
    });
    utils.call("getBalance").then((result) => {
      this.setState({ balance: result.data.balance });
    });
  }

  render() {
    return (
      <section id="popup">
        {this.state.currentAccount}
        <h2>{this.state.alias}</h2>
        <p>{this.state.balance}</p>
        <button
          id="options__button"
          type="button"
          onClick={() => {
            return utils.openPage("options.html");
          }}
        >
          Options Page
        </button>
      </section>
    );
  }
}

export default Popup;
