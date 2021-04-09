import React from "react";

import { createHashHistory } from "history";
import { HashRouter, Switch, Route } from "react-router-dom";

import Home from "./Home";
import LndSetup from "./LndSetup";
import LndConfirm from "./LndConfirm";
import Success from "./Success";

import Accounts from "../../../common/lib/accounts";

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
    // password: null
    // };
    this.history = createHashHistory();
    this.accountsStore = new Accounts();
  }

  state = {
    password: null,
    lndName: null,
    lndMacaroon: null,
    lndUrl: null,
  };

  setLndConfig(config) {
    console.log("setting lnd config", config);
    this.setState((state) => {
      return {
        lndName: config.lndName ?? null,
        lndMacaroon: config.lndMacaroon ?? null,
        lndUrl: config.lndUrl ?? null,
      };
    });
  }
  setPassword(pw) {
    console.log("setting password", pw);
    this.setState((state) => {
      return {
        password: pw,
      };
    });
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
          <Route
            exact
            path="/lnd/setup"
            render={(props) => (
              <LndSetup
                setLndConfig={(config) => this.setLndConfig(config)}
                title={`Props through component`}
                setPassword={(pw) => this.setPassword(pw)}
              />
            )}
          />
          <Route
            exact
            path="/lnd/confirm"
            render={(props) => (
              <LndConfirm
                lndName={this.state.lndName}
                lndMacaroon={this.state.lndMacaroon}
                lndUrl={this.state.lndUrl}
              />
            )}
          />
          <Route exact path="/success" render={(props) => <Success />} />
        </Switch>
      </HashRouter>
    );
  }
}

export default Welcome;
