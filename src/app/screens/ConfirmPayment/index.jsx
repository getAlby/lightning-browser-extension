import React from "react";
import { createHashHistory } from "history";

import Button from "../../components/button";
import Checkbox from "../../components/Form/Checkbox";
import Collapse from "../../components/Collapse";
import PaymentSummary from "../../components/PaymentSummary";
import PublisherCard from "../../components/PublisherCard";
import msg from "../../../common/lib/msg";

class ConfirmPayment extends React.Component {
  constructor(props) {
    super(props);
    console.log("props", props);
    this.history = createHashHistory();
    this.state = {
      budget: null,
      rememberMe: false,
    };
  }

  enable() {
    if (this.state.rememberMe && this.state.budget) {
      this.saveBudget();
    }

    msg.reply({
      confirmed: true,
    });
  }

  reject(e) {
    e.preventDefault();
    msg.error("User rejected");
  }

  setBudget(satoshi) {
    this.setState({ budget: parseInt(satoshi) });
  }

  saveBudget() {
    return msg.request(
      "setAllowance",
      { budget: this.state.budget, spent: 0, enabled: true },
      { origin: this.props.origin }
    );
  }

  render() {
    return (
      <div>
        <PublisherCard
          title="The Biz with John Carvalho"
          image="https://img.podplay.com/922c5e7d-0230-51d4-a81c-578eb3d7c616/575/575"
        />

        <div className="p-6">
          <div className="mb-8">
            <PaymentSummary
              amount={`${this.props.invoice?.valueSat}`}
              amountAlt="$28.55"
              description={`${this.props.invoice?.desc}`}
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center">
              <Checkbox
                id="remember_me"
                name="remember_me"
                checked={this.state.rememberMe}
                onChange={(event) => {
                  this.setState({ rememberMe: event.target.checked });
                }}
              />
              <label
                htmlFor="remember_me"
                className="ml-2 block text-sm text-gray-900 font-medium"
              >
                Remember and set a budget
              </label>
            </div>

            <Collapse isOpen={this.state.rememberMe}>
              <div>
                <p className="pt-4 text-gray-500 text-sm">
                  You may set a balance to not be asked for confirmation on
                  payments until it is exhausted.
                </p>
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Budget
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      name="price"
                      id="price"
                      className="focus:ring-orange-bitcoin focus:border-orange-bitcoin block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      onChange={(event) => {
                        this.setBudget(event.target.value);
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <label htmlFor="currency" className="sr-only">
                        Currency
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        className="focus:ring-orange-bitcoin focus:border-orange-bitcoin h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                      >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>BTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>
          </div>

          <div className="text-center">
            <div className="mb-5">
              <Button onClick={() => this.enable()} label="Confirm" fullWidth />
            </div>

            <p className="mb-3 underline text-sm text-gray-300">
              Only connect with sites you trust.
            </p>

            <a
              className="underline text-sm text-gray-500"
              href="#"
              onClick={this.reject}
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ConfirmPayment;
