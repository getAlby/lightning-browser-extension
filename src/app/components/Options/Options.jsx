import React from "react";
import { createHashHistory } from "history";
import { HashRouter, Route, Switch } from "react-router-dom";
import { Layout } from "antd";

import passwordManager from "../../../common/lib/password-manager";
import Account from "../Account";
import SetPassword from "../SetPassword";
import Unlock from "../Unlock";
import Configurations from "../Configurations";
import Loading from "../Loading";

const { Header, Content } = Layout;
class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkDataStoreState();
    this.history = createHashHistory();
  }

  async checkDataStoreState() {
    await passwordManager.checkPassword();
    this.setState({ isInitialized: await passwordManager.isInitialized() });
    this.setState({ isUnlocked: await passwordManager.isUnlocked() });
  }

  async handlePasswordConfigured() {
    await this.checkDataStoreState();
    // move forward
  }

  async handleUnlock() {
    await this.checkDataStoreState();
  }

  async componentDidMount() {
    await this.checkDataStoreState();
    if (this.state.isInitialized === false) {
      return this.history.replace("/init");
    }
    if (this.state.isUnlocked === false) {
      return this.history.replace("/unlock");
    }
    if (this.state.isInitialized === true && this.state.isUnlocked === true) {
      return this.history.replace("/config");
    }
    return this.history.replace("/");
  }

  render() {
    return (
      <Layout>
        <Header>Lightning Extension Configuration</Header>

        <Content>
          <HashRouter>
            <section id="prompt">
              <Switch>
                <Route
                  exact
                  path="/unlock"
                  render={() =>
                    this.state.isUnlocked === true ? (
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
                    this.state.isInitialized === true ? (
                      <SetPassword
                        onOk={this.handlePasswordConfigured.bind(this)}
                      ></SetPassword>
                    ) : (
                      <Loading />
                    )
                  }
                />
                <Route
                  exact
                  path="/config"
                  render={() =>
                    this.state.isInitialized === true &&
                    this.state.isUnlocked === true ? (
                      <Configurations />
                    ) : (
                      <Loading />
                    )
                  }
                />
                <Route exact path="/account" render={() => <Account />} />
                <Route exact path="/" render={() => <Loading />} />
              </Switch>
            </section>
          </HashRouter>
        </Content>
      </Layout>
    );
  }
}

export default Options;
