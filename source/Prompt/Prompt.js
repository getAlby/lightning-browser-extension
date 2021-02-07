import React from "react";
import browser from "webextension-polyfill";
import qs from "query-string";

import Settings from "../lib/settings";

import "./styles.scss";

const settings = new Settings({});

class Prompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  enable() {
    if (this.state.remember) {
      settings.allowHost(this.state.origin.domain, { enabled: true });
    }
    return browser.runtime.sendMessage({
      response: true,
      data: { enabled: true },
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

  componentDidMount() {
    const message = qs.parse(window.location.search);
    let origin = {};
    let args = {};
    if (message.origin) {
      origin = JSON.parse(message.origin);
    }
    if (message.args) {
      args = JSON.parse(message.args);
    }
    this.setState({ origin, args });
    return browser.runtime.sendMessage({
      unlock: "btc",
      application: "Joule",
    });
  }

  render() {
    return (
      <section id="prompt">
        <strong>{JSON.stringify(this.state.origin)}</strong>
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

export default Prompt;
