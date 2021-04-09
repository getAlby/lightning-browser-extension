import React from "react";

import { createHashHistory } from "history";

import { encryptData } from "../../../common/lib/crypto";
import Accounts from "../../../common/lib/accounts";
import Settings from "../../../common/lib/settings";

import LndForm from "../lnd";

class LndSetup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.history = createHashHistory();
    this.accountsStore = new Accounts();
    this.settingsStore = new Settings();
  }

  componentDidMount() {
    return Promise.all([
      this.accountsStore.load(),
      this.settingsStore.load(),
    ]).then(() => {
      console.log(this.accountsStore.accounts);
    });
  }

  saveLndAccount(values) {
    values.password = "btc";
    const account = {
      name: values.name,
      config: {
        macaroon: values.macaroon,
        url: values.url,
      },
      connector: "lnd",
    };
    // need to pass details to welcome.js state here since after setting the Account the config
    // is not readable anymore as entered here
    this.props.setLndConfig({
      lndName: account.name ?? null,
      lndMacaroon: account.config.macaroon ?? null,
      lndUrl: account.config.url ?? null,
    });
    account.config = encryptData(
      account.config,
      values.password,
      this.settingsStore.salt
    );
    return this.accountsStore.setAccount(account, true).then(() => {
      // TODO: account config should be marked accepted in the welcome.js store
      this.history.push("/lnd/confirm");
    });
  }
  formSubmitFailure() {}

  render() {
    return (
      <div>
        <h2>Connect your LND node</h2>
        <p></p>
        <LndForm
          saveLndAccount={(values, ref) => {
            this.saveLndAccount(values);
          }}
          addLndAccountFailure={this.formSubmitFailure}
        />
      </div>
    );
  }
}

export default LndSetup;
