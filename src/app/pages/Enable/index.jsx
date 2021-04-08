import React from "react";
import { createHashHistory } from "history";

import { Button } from "antd";

import msg from "../../../common/lib/msg";

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
      spent: 0,
    });
  }

  reject() {
    msg.error("User rejected");
  }

  setRemember(remember) {
    return this.setState({ remember });
  }

  setBudget(satoshi) {
    this.setState({ budget: parseInt(satoshi) });
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

        <Button type="default" onClick={() => this.reject()}>
          Reject
        </Button>
        <Button type="primary" onClick={() => this.enable()}>
          Enable
        </Button>
      </section>
    );
  }
}

export default Enable;
