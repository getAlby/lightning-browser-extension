import React from "react";
import { createHashHistory } from "history";
import { LockOpenIcon } from "@heroicons/react/solid";

import utils from "../../../common/lib/utils";
import Button from "../../components/button";
import Input from "../../components/Form/input";

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
      <div className="p-8 text-center">
        <LockOpenIcon
          className="inline mb-4 h-16 w-16 text-blue-500"
          aria-hidden="true"
        />
        <h2 className="text-2xl font-bold mb-4">Unlock:</h2>
        <form onSubmit={this.handleSubmit}>
          <div className="mb-4">
            <Input
              placeholder="Password"
              size="small"
              type="password"
              autoFocus
              value={this.state.password}
              onChange={this.handlePasswordChange}
            />
          </div>
          <Button type="submit" label="unlock" fullWidth />
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
