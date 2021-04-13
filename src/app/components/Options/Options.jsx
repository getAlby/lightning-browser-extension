import React from "react";
// import utils from "../../../common/lib/utils";
import dataStore from "../../../extension/storage";
import PasswordManager from "../../../common/lib/password-manager";
import SetPassword from "../SetPassword";
import Unlock from "../Unlock";
// import Accounts from "../../../common/lib/accounts";

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

  render() {
    const handlePasswordModalOk = (password) => {
      console.log("#### handlePasswordModalOk", password);
      const passwordManager = new PasswordManager();
      passwordManager.init(password, password);
      // move forward
    };
    console.log("######################### this.state:", this.state);

    if (!this.state.isInitialized) {
      return <SetPassword onOk={handlePasswordModalOk}></SetPassword>;
    }
    if (!this.state.isUnlocked) {
      return <Unlock next="/home" />;
    }
    return (
      <div>
        <section id="options">Options</section>
      </div>
    );
  }
}

export default Options;
