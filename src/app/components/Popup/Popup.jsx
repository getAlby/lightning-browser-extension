import React from "react";
import Home from "../Home";
import passwordManager from "../../../common/lib/password-manager";

import Unlock from "../Unlock";
import SetPassword from "../SetPassword";
import Loading from "../Loading";

import "./styles.scss";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    await this.checkDataStoreState();
  }

  async checkDataStoreState() {
    await passwordManager.checkPassword();
    this.setState({ isInitialized: await passwordManager.isInitialized() });
    this.setState({ isUnlocked: await passwordManager.isUnlocked() });
  }

  async handlePasswordConfigured() {
    await this.checkDataStoreState();
  }

  async handleUnlock() {
    await this.checkDataStoreState();
  }

  render() {
    if (this.state.isInitialized === false) {
      return (
        <section id="popup">
          <SetPassword
            onOk={this.handlePasswordConfigured.bind(this)}
          ></SetPassword>
        </section>
      );
    }
    if (this.state.isUnlocked === false) {
      return (
        <section id="popup">
          <Unlock onUnlock={this.handleUnlock.bind(this)} />
        </section>
      );
    }
    if (this.state.isInitialized === true && this.state.isUnlocked === true) {
      return (
        <section id="popup">
          <Home />
        </section>
      );
    }
    return <Loading />;
  }
}

export default Popup;
