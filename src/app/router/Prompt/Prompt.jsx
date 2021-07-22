import React from "react";
import qs from "query-string";
import { createHashHistory } from "history";
import { HashRouter, Route, Switch } from "react-router-dom";

import "./styles.scss";

import utils from "../../../common/lib/utils";
import Unlock from "../../screens/Unlock";
import Enable from "../../screens/Enable";
import Loading from "../../components/Loading";
import ConfirmPayment from "../../screens/ConfirmPayment";
import LNURLPay from "../../screens/LNURLPay";
let invoiceParser = require("@node-lightning/invoice");

class Prompt extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    const message = qs.parse(window.location.search);
    let origin = {};
    let args = {};
    let invoice = {};
    console.log(message);
    if (message.origin) {
      origin = JSON.parse(message.origin);
    }
    if (message.args) {
      args = JSON.parse(message.args);
      if (args.paymentRequest) {
        invoice = invoiceParser.decode(args.paymentRequest);
      }
    }
    this.state = { origin, args, invoice, type: message.type };
  }

  componentDidMount() {
    utils.call("isUnlocked").then((response) => {
      if (response.unlocked) {
        this.history.replace(`${this.state.type}`);
      } else {
        this.history.replace("/unlock");
      }
    });
  }

  render() {
    return (
      <HashRouter>
        <section id="prompt">
          <Switch>
            <Route exact path="/" render={(props) => <Loading />} />
            <Route
              exact
              path="/unlock"
              render={(props) => <Unlock next={`/${this.state.type}`} />}
            />
            <Route
              exact
              path="/enable"
              render={(props) => <Enable origin={this.state.origin} />}
            />
            <Route exact path="/lnurlPay">
              <LNURLPay
                details={this.state.args?.lnurlDetails}
                origin={this.state.origin}
              />
            </Route>
            <Route
              exact
              path="/sendPayment"
              render={(props) => (
                <ConfirmPayment
                  invoice={this.state.invoice}
                  origin={this.state.origin}
                />
              )}
            />
          </Switch>
        </section>
      </HashRouter>
    );
  }
}

export default Prompt;
