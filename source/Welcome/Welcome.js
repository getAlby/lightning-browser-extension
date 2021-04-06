import React from "react";

import utils from "../lib/utils";
import Accounts from "../lib/accounts";
import Allowances from "../lib/allowances";
import Settings from "../lib/settings";

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.accounts = new Accounts();
    this.settings = new Settings();
    this.allowances = new Allowances();
  }

  componentDidMount() {}

  reset() {
    //browser.storage.sync.set({ accounts: {} });
    //browser.storage.sync.set({ settings: {} });
    //browser.storage.sync.set({ allowances: {} });
    this.accounts.reset();
    this.allowances.reset();
    this.settings.reset();
    alert("Done, you can start over");
    utils.openPage("Options.html");
  }

  render() {
    return (
      <div>
        <p>Hallo</p>
        <span
          onClick={() => {
            this.reset();
          }}
        >
          Reset Everything
        </span>
      </div>
    );
  }
}

export default Welcome;
