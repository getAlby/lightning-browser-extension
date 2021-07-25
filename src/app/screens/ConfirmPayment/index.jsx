import React from "react";
import { createHashHistory } from "history";

import Button from "../../components/button";
import Checkbox from "../../components/Form/Checkbox";
import CurrencyInput from "../../components/Form/CurrencyInput";
import Collapse from "../../components/Collapse";
import PaymentSummary from "../../components/PaymentSummary";
import PublisherCard from "../../components/PublisherCard";
import msg from "../../../common/lib/msg";

class ConfirmPayment extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    this.state = {
      budget: this.props.invoice?.mtokens || 0,
      rememberMe: false,
    };
  }

  async confirm() {
    if (this.state.rememberMe && this.state.budget) {
      await this.saveBudget();
    }

    return await msg.reply({
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
    return msg.request("addAllowance", {
      totalBudget: this.state.budget,
      host: this.props.origin.host,
      name: this.props.origin.name,
      imageURL: this.props.origin.icon,
    });
  }

  render() {
    return (
      <div>
        <PublisherCard
          title={this.props.origin.name}
          image={this.props.origin.icon}
        />

        <div className="p-6">
          <div className="mb-8">
            <PaymentSummary
              amount={this.props.invoice?.mtokens}
              description={this.props.invoice?.description}
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
                    htmlFor="budget"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Budget
                  </label>
                  <CurrencyInput
                    id="budget"
                    name="budget"
                    placeholder="sats"
                    value={this.state.budget}
                    onChange={(event) => {
                      this.setBudget(event.target.value);
                    }}
                  />
                </div>
              </div>
            </Collapse>
          </div>

          <div className="text-center">
            <div className="mb-5">
              <Button
                onClick={() => this.confirm()}
                label="Confirm"
                fullWidth
              />
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
