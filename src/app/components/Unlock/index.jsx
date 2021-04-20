import React from "react";
import { createHashHistory } from "history";
import { Button, Input } from "antd";
import { UnlockTwoTone } from "@ant-design/icons";

import messagingSvc from "../../../common/services/messaging.svc";
import passwordSvc from "../../../common/services/password.svc";
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
  }

  handlePasswordChange(event) {
    this.setState({ error: null, password: event.target.value });
  }

  async unlock() {
    const isValidPassword = await passwordSvc.checkPassword(
      this.state.password
    );
    if (isValidPassword) {
      messagingSvc.sendMessage("set-password-to-cache", {
        password: this.state.password,
      });
      this.props.onUnlock && this.props.onUnlock();
    } else {
      this.setState({ error: "Incorrect Password!" });
    }
  }

  render() {
    return (
      <div class="unlock--container">
        <UnlockTwoTone
          className="unlock--container__icon"
          twoToneColor={variables.lightBlue}
        />
        <h2>Unlock:</h2>
        <Input.Password
          placeholder="Password"
          size="small"
          type="text"
          value={this.state.password}
          onChange={(event) => this.handlePasswordChange(event)}
        />
        <Button
          onClick={(e) => {
            this.unlock();
          }}
        >
          Unlock
        </Button>
        <p>{this.state.error}</p>
      </div>
    );
  }
}

export default Unlock;
