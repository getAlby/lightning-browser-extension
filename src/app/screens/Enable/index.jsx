import React from "react";
import { createHashHistory } from "history";
import Blur from "react-blur";

import Button from "../../components/button";
import msg from "../../../common/lib/msg";

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
    this.enable = this.enable.bind(this);
    this.reject = this.reject.bind(this);
  }

  enable() {
    msg.reply({
      enabled: true,
      remember: this.state.remember,
      budget: this.state.budget,
      spent: 0,
    });
  }

  reject(event) {
    msg.error("User rejected");
    event.preventDefault();
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
      <div className="text-center">
        <header>
          <Blur
            className="bg-black"
            img="https://img.podplay.com/922c5e7d-0230-51d4-a81c-578eb3d7c616/575/575"
            blurRadius={100}
            enableStyles
          >
            <div className="relative p-6">
              <img
                class="w-32 h-32 rounded-2xl shadow-md mx-auto mb-4"
                src="https://img.podplay.com/922c5e7d-0230-51d4-a81c-578eb3d7c616/575/575"
                alt=""
              />
              <h2 className="mb-0 text-3xl text-white">
                The Biz with John Carvalho
              </h2>
            </div>
          </Blur>
        </header>

        <div className="p-5">
          {/* <strong>{JSON.stringify(this.props.origin)}</strong> */}
          {/* <strong>{JSON.stringify(this.state)}</strong> */}
          <h3 className="text-2xl">
            Connect with <i>host.com</i>
          </h3>

          <p className="text-xl text-gray-500">
            <strong>The Hype Machine (hypem.com)</strong> does not have access
            to your account.
          </p>
          <p className="text-xl text-gray-500">
            Do you want to grant them access?
          </p>

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

          <div className="mb-4">
            <Button
              type="primary"
              label="Enable"
              fullWidth
              onClick={this.enable}
            />
          </div>

          <p className="underline text-base text-gray-300">
            Only connect with sites you trust.
          </p>

          <a
            className="underline text-base text-gray-500"
            href="#"
            onClick={this.reject}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default Enable;
