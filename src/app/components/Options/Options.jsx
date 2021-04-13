import React from "react";
import dataStore from "../../../extension/storage";
import SetPassword from "../SetPassword";
import Unlock from "../Unlock";

// const accountsStore = new Accounts();
class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkDataStoreState();
  }

  async checkDataStoreState() {
    const storage = dataStore();
    this.setState({ isInitialized: await storage.isInitialized() });
    this.setState({ isUnlocked: await storage.isUnlocked() });
  }

  async handlePasswordConfigured() {
    console.log("######################### handlePasswordConfigured");
    await this.checkDataStoreState();
    // move forward
  }

  async handleUnlock() {
    console.log("######################### handleUnlock");
    await this.checkDataStoreState();
  }

  render() {
    if (!this.state.isInitialized) {
      return (
        <SetPassword
          onOk={this.handlePasswordConfigured.bind(this)}
        ></SetPassword>
      );
    }
    if (!this.state.isUnlocked) {
      return <Unlock onUnlock={this.handleUnlock.bind(this)} next="/home" />;
    }
    return (
      <div>
        <section id="options">Options</section>
      </div>
    );
  }
}

export default Options;
