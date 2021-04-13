import React from "react";
import { createHashHistory } from "history";
import { Button, Input } from "antd";
import { UnlockTwoTone } from "@ant-design/icons";

import utils from "../../../common/lib/utils";
import PasswordManager from "../../../common/lib/password-manager";
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
    const passwordManager = new PasswordManager();
    const isValidPassword = await passwordManager.checkPassword(
      this.state.password
    );
    if (isValidPassword) {
      const next = this.props.next || "/home";
      this.history.push(next);
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
