import React from "react";
import browser from "webextension-polyfill";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import { createHashHistory } from "history";
import utils from "../lib/utils";

import "./styles.scss";

class Loading extends React.Component {
  render() {
    return <div>loading</div>;
  }
}
class Unlock extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    this.state = {
      password: "",
    };
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  unlock() {
    utils.call("unlock", { password: this.state.password }).then(() => {
      this.history.push("/home");
    });
  }

  render() {
    return (
      <div>
        <h2>Unlock:</h2>
        <input
          type="text"
          value={this.state.password}
          onChange={(event) => this.handlePasswordChange(event)}
        />
        <button
          onClick={(e) => {
            this.unlock();
          }}
        >
          Unlock
        </button>
      </div>
    );
  }
}

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
      this.setState({ alias: info.data.alias });
    });
    utils.call("getBalance").then((result) => {
      this.setState({ balance: result.data.balance });
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
      </div>
    );
  }
}

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
  }

  componentDidMount() {
    utils.call("isUnlocked").then((unlocked) => {
      if (unlocked) {
        this.history.replace("/home");
      } else {
        this.history.replace("/unlock");
      }
    });
  }

  render() {
    return (
      <HashRouter>
        <section id="popup">
          <Switch>
            <Route exact path="/" render={(props) => <Loading />} />
            <Route exact path="/home" render={(props) => <Home />} />
            <Route exact path="/unlock" render={(props) => <Unlock />} />
          </Switch>
        </section>
      </HashRouter>
    );
  }
}

export default Popup;
