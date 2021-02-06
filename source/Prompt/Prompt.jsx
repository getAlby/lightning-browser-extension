import React, { useState } from "react";
import browser from "webextension-polyfill";
import qs from "query-string";

import "./styles.scss";

export default class Prompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  enable() {
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

  componentDidMount() {
    const message = qs.parse(location.search);
    let origin = {};
    let args = {};
    if (message.origin) {
      origin = JSON.parse(message.origin);
    }
    if (message.args) {
      args = JSON.parse(message.args);
    }
    this.setState({ origin, args });
  }

  render() {
    return (
      <section id="prompt">
        <strong>{JSON.stringify(this.state.origin)}</strong>
        <h2>Allow access?</h2>
        <button onClick={() => this.enable()}>Enable</button>
        <br />
        <button onClick={() => this.reject()}>Reject</button>
      </section>
    );
  }
}
