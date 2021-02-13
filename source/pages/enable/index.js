import React from "react";
import browser from "webextension-polyfill";
import { createHashHistory } from "history";

import msg from "../../lib/msg";

// import "./styles.scss";

class Enable extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    this.state = {
      loading: true,
      remember: false,
      enabled: false,
      budget: null,
    };
  }

  enable() {
    msg.reply({
      enabled: true,
      remember: this.state.remember,
      budget: this.state.budget,
    });
  }

  reject() {
    msg.error("User rejected");
  }

  setRemember(remember) {
    return this.setState({ remember });
  }

  setBudget(satoshi) {
    this.setState({ budget: satoshi });
  }

  componentDidMount() {
    msg
      .request("getAllowance", { domain: this.props.origin.domain })
      .then((allowance) => {
        this.setState({ ...allowance });
        if (allowance && allowance.enabled) {
          this.enable();
        }
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <section id="prompt">
        <strong>{JSON.stringify(this.props.origin)}</strong>
        <strong>{JSON.stringify(this.state)}</strong>
        <h2>Allow access?</h2>
        <input
          name="remember"
          type="checkbox"
          onChange={(event) => {
            this.setRemember(event.target.checked);
          }}
        />

        <p>
          Budget:
          <input
            type="text"
            name="budget"
            onChange={(event) => {
              this.setBudget(event.target.value);
            }}
          />
        </p>

        <button onClick={() => this.enable()}>Enable</button>
        <br />
        <button onClick={() => this.reject()}>Reject</button>
      </section>
    );
  }
}

export default Enable;
