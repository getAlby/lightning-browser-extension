import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { createHashHistory } from "history";

import passwordSvc from "../../../common/services/password.svc";

import Home from "../Home";
import Unlock from "../Unlock";
import SetPassword from "../SetPassword";
import Loading from "../Loading";

import "./styles.scss";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.history = createHashHistory();
    this.checkDataStoreState();
  }

  async componentDidMount() {
    await this.checkDataStoreState();
  }

  async checkDataStoreState() {
    await passwordSvc.checkPassword();
    this.setState({ isInitialized: await passwordSvc.isInitialized() });
    this.setState({ isUnlocked: await passwordSvc.isUnlocked() });
    this.updateRoute();
  }

  async updateRoute() {
    if (this.state.isInitialized === false) {
      return this.history.replace("/init");
    }
    if (this.state.isUnlocked === false) {
      return this.history.replace("/unlock");
    }
    if (this.state.isInitialized === true && this.state.isUnlocked === true) {
      return this.history.replace("/home");
    }
    return this.history.replace("/");
  }

  async handlePasswordConfigured() {
    await this.checkDataStoreState();
  }

  async handleUnlock() {
    await this.checkDataStoreState();
  }

  render() {
    return (
      <HashRouter>
        <section id="popup">
          <Switch>
            <Route
              exact
              path="/unlock"
              render={() =>
                this.state.isUnlocked === false ? (
                  <Unlock onUnlock={this.handleUnlock.bind(this)} />
                ) : (
                  <Loading />
                )
              }
            />
            <Route
              exact
              path="/init"
              render={() =>
                this.state.isInitialized === false ? (
                  <SetPassword
                    onOk={this.handlePasswordConfigured.bind(this)}
                  ></SetPassword>
                ) : (
                  <Loading />
                )
              }
            />
            <Route exact path="/home" render={() => <Home />} />
            <Route exact path="/" render={() => <Loading />} />
          </Switch>
        </section>
      </HashRouter>
    );
  }
}

export default Popup;
