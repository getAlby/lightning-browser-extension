import React from "react";
import { createHashHistory } from "history";
import { Button, Input, Result } from 'antd';

import msg from "../../../common/lib/msg";

import "./styles.scss";

class ConfirmPayment extends React.Component {
  constructor(props) {
    super(props);
    console.log('props', props)
    this.history = createHashHistory();
    this.state = {
      budget: null,
      budgetSet: false
    };
  }

  enable() {
    msg.reply({
      confirmed: true,
    });
  }

  reject() {
    msg.error("User rejected");
  }

  setBudget(satoshi) {
    this.setState({ budget: parseInt(satoshi) });
  }

  saveBudget() {
    this.setState({ budgetSaved: true })
    return msg.request(
      "setAllowance",
      { budget: this.state.budget, spent: 0, enabled: true },
      { origin: this.props.origin }
    );
  }

  render() {
    return (
      <div className="d-flex">
        <section 
          id="confirm-payment"
          className="confirm-payment--container d-flex"
        >
            <Result
                status="info"
                title={`Please confirm your payment of ${this.props.invoice?.valueSat} Satoshi`}
                subTitle={`You are about to pay an invoice on ${this.props.origin?.domain} for ${this.props.invoice?.desc}`}
                extra={[
                      <div className="confirm-payment--container__actions d-flex">
                        <div className="d-flex">
                        <Input
                          type="text"
                          name="budget"
                          placeholder="Budget"
                          addonBefore="Satoshi"
                          onChange={(event) => {
                            this.setBudget(event.target.value);
                          }}
                        />
                          {!this.state.budgetSaved &&
                            <Button 
                              onClick={() =>
                                this.saveBudget()
                              }
                              type="dashed" 
                              danger
                            >Save Budget</Button>
                          }
                          {this.state.budgetSaved &&
                            <Button ghost disabled>Budget saved</Button>
                          }
                        </div>
                        <div class="ant-result-subtitle">You may set a balance to not be asked for confirmation on payments until it is exhausted.</div>

                        <div className="confirm-payment--container__actions--budget  d-flex">
                        </div>
                        <div className="confirm-payment--container__actions--cta  d-flex">
                          <Button 
                            type="primary"
                            onClick={() => this.enable()}
                            key="console">
                                    Confirm
                          </Button>
                          <Button 
                            onClick={() => this.reject()}
                            key="buy">Reject</Button>
                        </div>
                      </div>
                ]}
              />
        </section>
      </div>
    );
  }
}

export default ConfirmPayment;
