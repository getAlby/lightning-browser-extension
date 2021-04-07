import React from "react";
import { createHashHistory } from "history";

import msg from "../../../common/lib/msg";

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

  setBudget(satoshi) {
    this.setState({ budget: parseInt(satoshi) });
  }

  saveBudget() {
    return msg.request(
      "setAllowance",
      { budget: this.state.budget, spent: 0, enabled: true },
      { origin: this.props.origin }
    );
  }

  render() {
    return (
      <section id="confirm-payment">
        <button onClick={() => this.enable()}>Confirm</button>
        <br />
        <button onClick={() => this.reject()}>Reject</button>
        <hr />
        <p>
          Budget:
          <input
            type="text"
            name="budget"
            onChange={(event) => {
              this.setBudget(event.target.value);
            }}
          />
          <button onClick={() => this.saveBudget()}>Save Budget</button>
        </p>
      </section>
    );
  }
}

export default ConfirmPayment;
