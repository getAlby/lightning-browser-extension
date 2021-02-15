import React from "react";
import browser from "webextension-polyfill";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import { createHashHistory } from "history";
import utils from "../../lib/utils";

//import "./styles.scss";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alias: "",
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
    utils.call("getBalance").then((result) => {
      this.setState({ balance: result.balance });
    });
  }

  render() {
    return (
      <div>
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
        <button
          type="button"
          onClick={() => {
            return utils.openPage("welcome.html");
          }}
        >
          Welcome
        </button>
      </div>
    );
  }
}

export default Home;
