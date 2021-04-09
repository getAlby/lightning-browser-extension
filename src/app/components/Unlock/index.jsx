import React from "react";
import { createHashHistory } from "history";
import { Button, Input } from "antd";
import { UnlockTwoTone } from "@ant-design/icons";

import utils from "../../../common/lib/utils";

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
      <div class="unlock--container">
        <UnlockTwoTone
          className="unlock--container__icon"
          twoToneColor="#1890ff"
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
