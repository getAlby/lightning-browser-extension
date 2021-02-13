import React from "react";
import browser from "webextension-polyfill";
import { createHashHistory } from "history";

import msg from "../../lib/msg";

// import "./styles.scss";

class ConfirmPayment extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    this.state = {};
  }

  enable() {
    msg.reply({
      confirmed: true,
    });
  }

  reject() {
    msg.error("User rejected");
  }

  render() {
    return (
      <section id="confirm-payment">
        <button onClick={() => this.enable()}>Confirm</button>
        <br />
        <button onClick={() => this.reject()}>Reject</button>
      </section>
    );
  }
}

export default ConfirmPayment;
