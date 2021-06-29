import React from "react";
import { createHashHistory } from "history";
import { Button, Input } from "antd";
import { UnlockTwoTone } from "@ant-design/icons";

import utils from "../../../common/lib/utils";
import variables from "./variables.module.scss";
import "./styles.scss";

class Unlock extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    this.state = {
      password: "",
      error: "",
    };
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handlePasswordChange(event) {
    this.setState({ error: null, password: event.target.value });
  }

  handleSubmit(event) {
    this.unlock();
    event.preventDefault();
  }

  reset() {
    utils.openPage("welcome.html");
  }

  unlock() {
    utils
      .call("unlock", { password: this.state.password })
      .then(() => {
        const next = this.props.next || "/home";
        this.history.push(next);
      })
      .catch((e) => {
        this.setState({ error: e.message });
      });
  }

  render() {
    return (
      <div className="unlock--container p-8">
        <UnlockTwoTone
          className="unlock--container__icon"
          twoToneColor={variables.lightBlue}
        />
        <h2>Unlock:</h2>
        <form onSubmit={this.handleSubmit}>
          <Input.Password
            placeholder="Password"
            size="small"
            type="text"
            autoFocus
            value={this.state.password}
            onChange={this.handlePasswordChange}
          />
          <Button htmlType="submit">Unlock</Button>
        </form>
        {this.state.error && (
          <p>
            {this.state.error} (
            <span
              onClick={(event) => {
                this.reset();
              }}
            >
              config
            </span>
            )
          </p>
        )}
      </div>
    );
  }
}

export default Unlock;
