import React from "react";
import passwordManager from "../../../common/lib/password-manager";
import SetPassword from "../SetPassword";
import Unlock from "../Unlock";
import Configurations from "../Configurations";

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkDataStoreState();
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

  render() {
    if (this.state.isInitialized === false) {
      return (
        <SetPassword
          onOk={this.handlePasswordConfigured.bind(this)}
        ></SetPassword>
      );
    }
    if (this.state.isUnlocked === false) {
      return <Unlock onUnlock={this.handleUnlock.bind(this)} />;
    }
    if (this.state.isInitialized === true && this.state.isUnlocked === true) {
      return <Configurations />;
    }
    return <span>Loading...</span>;
  }
}

export default Options;
