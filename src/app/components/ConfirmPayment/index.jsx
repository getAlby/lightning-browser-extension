import React from "react";
import { createHashHistory } from "history";
import { Button, Input, Result } from 'antd';

import msg from "../../../common/lib/msg";

// import "./styles.scss";

class ConfirmPayment extends React.Component {
  constructor(props) {
    super(props);
    console.log('props', props)
    this.history = createHashHistory();
    this.state = {};
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
          className="confirm-payment--container"
        >
            <Result
                status="info"
                title="Please confirm your payment of 100 Satoshi"
                subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."
                extra={[
                      <Button type="primary" key="console">
                                Go Console
                              </Button>,
                          <Button key="buy">Buy Again</Button>,
                        ]}
              />
            Budget:
            <Input
              type="text"
              name="budget"
              onChange={(event) => {
                this.setBudget(event.target.value);
              }}
            />
            <Button onClick={() => this.saveBudget()}>Save Budget</Button>
          <div className="confirm-payment--container__actions d-flex">
            <Button onClick={() => this.enable()}>Confirm</Button>
            <br />
            <Button onClick={() => this.reject()}>Reject</Button>
          </div>
        </section>
      </div>
    );
  }
}

export default ConfirmPayment;
