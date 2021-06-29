import React from "react";
import { createHashHistory } from "history";

import Button from "../../components/button";
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
      budgetSet: false,
    };
  }

  enable() {
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
    this.setState({ budgetSaved: true });
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
          <div className="text-center mb-6">
            <div className="d-flex">
              <p className="mb-4">
                Satoshi:
                <input
                  type="text"
                  name="budget"
                  placeholder="Budget"
                  addonBefore="Satoshi"
                  onChange={(event) => {
                    this.setBudget(event.target.value);
                  }}
                />
              </p>
              {!this.state.budgetSaved && (
                <Button onClick={() => this.saveBudget()} label="Save Budget" />
              )}
              {this.state.budgetSaved && (
                <Button label="Budget saved">Budget saved</Button>
              )}
            </div>
            <div className="mt-4">
              You may set a balance to not be asked for confirmation on payments
              until it is exhausted.
            </div>
          </div>

          <div className="mb-8">
            <PaymentSummary
              amount={`${this.props.invoice?.valueSat}`}
              amountAlt="$28.55"
              description={`${this.props.invoice?.desc}`}
            />
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
