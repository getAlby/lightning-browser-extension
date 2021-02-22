import React from "react";
import browser from "webextension-polyfill";

import utils from "../lib/utils";

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  reset() {
    browser.storage.sync.set({ currentAccount: null });
    browser.storage.sync.set({ accounts: {} });
    browser.storage.sync.set({ settings: {} });
    browser.storage.sync.set({ hostSettings: {} });
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
