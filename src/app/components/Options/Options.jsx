import React from "react";
// import utils from "../../../common/lib/utils";
import dataStore from "../../../extension/storage";
// import Accounts from "../../../common/lib/accounts";

// const accountsStore = new Accounts();
class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.checkDatatoreState();
  }

  async checkDatatoreState() {
    const storage = dataStore();
    this.setState({ isInitialized: await storage.isInitialized() });
    this.setState({ isUnlocked: await storage.isUnlocked() });
  }

  render() {
    console.log("######################### this.state:", this.state);
    if (!this.state.isInitialized) {
      return (
        <div>
          <section id="options">Configure Password</section>
        </div>
      );
    }
    if (!this.state.isUnlocked) {
      return (
        <div>
          <section id="options">Enter Password</section>
        </div>
      );
    }
    return (
      <div>
        <section id="options">Options</section>
      </div>
    );
  }
}

export default Options;
