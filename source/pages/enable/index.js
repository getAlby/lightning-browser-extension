import React from "react";
import browser from "webextension-polyfill";
import { createHashHistory } from "history";

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
