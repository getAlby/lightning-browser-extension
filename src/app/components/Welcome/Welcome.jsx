import React from "react";

import { encryptData } from "../../../common/lib/crypto";
import utils from "../../../common/lib/utils";
import Accounts from "../../../common/lib/accounts";
import Allowances from "../../../common/lib/allowances";
import Settings from "../../../common/lib/settings";


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

  initDevelopmentAccount() {
    return Promise.all([
      this.accounts.reset(),
      this.allowances.reset(),
      this.settings.reset()
    ]).then(() => {
      const account = {
        name: "LND-DEV",
        config: {
          macaroon:
            "0201036C6E6402F801030A10A20DB3BCABE52F0186FAFB6CD5A79FED1201301A160A0761646472657373120472656164120577726974651A130A04696E666F120472656164120577726974651A170A08696E766F69636573120472656164120577726974651A210A086D616361726F6F6E120867656E6572617465120472656164120577726974651A160A076D657373616765120472656164120577726974651A170A086F6666636861696E120472656164120577726974651A160A076F6E636861696E120472656164120577726974651A140A057065657273120472656164120577726974651A180A067369676E6572120867656E657261746512047265616400000620AE1050A1B1EDA68D723F2AE0EC4561552E1F2507EFB552F86C3D7DE708BC7E1A",
          url: "https://regtest-bob.nomadiclabs.net",
        },
        connector: "lnd",
      };
      console.log(this.settings.salt);
      account.config = encryptData(account.config, "btc", this.settings.salt);
      return this.accounts.setAccount(account, true).then(() => {
        alert('Test account is saved. Your password is: btc');
      });
    });
  }

  render() {
    return (
      <div>
        <h1>Hello</h1>
        <p>
          <span onClick={() => { this.initDevelopmentAccount() }}>
            Reset and add development account
          </span>
        </p>
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
