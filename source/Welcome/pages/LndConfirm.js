import React from "react";

import { createHashHistory } from "history";
import { HashRouter, Link } from "react-router-dom";

import utils from "../../lib/utils";
import Accounts from "../../lib/accounts";
import Settings from "../../lib/settings";

class LndConfirm extends React.Component {
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
      console.log("accounts", this.accountsStore.accounts);
      utils.call("unlock", { password: "btc" }).then(() => {
        utils.call("getInfo").then((info) => {
          console.log(info);
          this.setState({ info });
        });
      });
    });
  }

  render() {
    return (
      <div>
        <h2>Review your details</h2>
        <p>
          <dl>
            <dt>LND Name</dt>
            <dd>{this.props.lndName}</dd>

            <dt>LND Macaroon</dt>
            <dd>{this.props.lndMacaroon}</dd>

            <dt>LND URL</dt>
            <dd>{this.props.lndUrl}</dd>
          </dl>
        </p>
        {JSON.stringify(this.state.info)}
        <hr />
        <HashRouter>
          <Link to="/success">Yes, looks good!</Link>
        </HashRouter>
      </div>
    );
  }
}

export default LndConfirm;
