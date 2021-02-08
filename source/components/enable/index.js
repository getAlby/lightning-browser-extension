import React from "react";
import browser from "webextension-polyfill";
import qs from "query-string";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import { createHashHistory } from "history";
import utils from "../../lib/utils";

// import "./styles.scss";

class Enable extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    this.state = {};
  }

  enable() {
    return browser.runtime.sendMessage({
      response: true,
      data: { enabled: true, remember: this.state.remember, allowance: false },
    });
  }

  reject() {
    return browser.runtime.sendMessage({
      response: true,
      error: "User rejected",
    });
  }

  handleRememberChange(remember) {
    return this.setState({ remember });
  }

  render() {
    return (
      <section id="prompt">
        <strong>{JSON.stringify(this.props.origin)}</strong>
        <h2>Allow access?</h2>
        <input
          name="remember"
          type="checkbox"
          onChange={(event) => {
            this.handleRememberChange(event.target.checked);
          }}
        />

        <button onClick={() => this.enable()}>Enable</button>
        <br />
        <button onClick={() => this.reject()}>Reject</button>
      </section>
    );
  }
}

export default Enable;
