import React from "react";
import browser from "webextension-polyfill";
import utils from "../lib/utils";

import "./styles.scss";

function openWebPage(url) {
  return browser.tabs.create({ url });
}

function openApp() {
  return browser.runtime.sendMessage({
    application: "Joule",
    prompt: true,
    type: "open",
    args: {},
    origin: { internal: true },
  });
}

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
    // TODO: cache? https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local
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
        {this.state.unlocked}
        {this.state.currentAccount}
        <h2>{this.state.alias}</h2>
        <p>{this.state.balance}</p>
        <button
          id="options__button"
          type="button"
          onClick={() => {
            return openWebPage("options.html");
          }}
        >
          Options Page
        </button>
        <button
          onClick={() => {
            return openApp();
          }}
        >
          Settings
        </button>
      </section>
    );
  }
}

export default Popup;
