import React from "react";
import { createHashHistory } from "history";
import dataStore from "../../../extension/storage";
import Home from "../Home";
import Unlock from "../Unlock";
import SetPassword from "../SetPassword";

import "./styles.scss";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.history = createHashHistory();
  }

  async componentDidMount() {
    console.log("######################### Popup.componentDidMount");
    await this.checkDataStoreState();
  }

  async checkDataStoreState() {
    const storage = dataStore();
    this.setState({ isInitialized: await storage.isInitialized() });
    this.setState({ isUnlocked: await storage.isUnlocked() });
  }

  async handlePasswordConfigured() {
    await this.checkDataStoreState();
  }

  async handleUnlock() {
    await this.checkDataStoreState();
  }

  render() {
    if (!this.state.isInitialized) {
      return (
        <section id="popup">
          <SetPassword
            onOk={this.handlePasswordConfigured.bind(this)}
          ></SetPassword>
        </section>
      );
    }
    if (!this.state.isUnlocked) {
      return (
        <section id="popup">
          <Unlock onUnlock={this.handleUnlock.bind(this)} />
        </section>
      );
    }
    return (
      <section id="popup">
        <Home />
      </section>
    );
  }
}

export default Popup;
