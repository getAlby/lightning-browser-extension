import React from "react";

import { createHashHistory } from "history";

import utils from "../../lib/utils";
import { encryptData } from "../../lib/crypto";
import Accounts from "../../lib/accounts";
import Settings from "../../lib/settings";

import LndForm from "../../forms/lnd";

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
    account.config = encryptData(
      account.config,
      values.password,
      this.settingsStore.salt
    );
    return this.accountsStore.setAccount(account, true).then(() => {
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
