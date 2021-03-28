import React from "react";
import browser from "webextension-polyfill";

import { createHashHistory } from "history";
import { HashRouter, Switch, Route } from "react-router-dom";

import utils from "../lib/utils";

import Home from "./pages/Home";
import LndSetup from "./pages/LndSetup";
import LndConfirm from "./pages/LndConfirm";
import Success from "./pages/Success";

import Accounts from "../lib/accounts";
import Settings from "../lib/settings";

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.history = createHashHistory();
    this.accountsStore = new Accounts();
  }

  componentDidMount() {
    this.accountsStore.reset();
  }

  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/" render={(props) => <Home />} />
          <Route exact path="/password" render={(props) => <Home />} />
          <Route exact path="/lnd/setup" render={(props) => <LndSetup />} />
          <Route exact path="/lnd/confirm" render={(props) => <LndConfirm />} />
          <Route exact path="/success" render={(props) => <Success />} />
        </Switch>
      </HashRouter>
    );
  }
}

export default Welcome;
