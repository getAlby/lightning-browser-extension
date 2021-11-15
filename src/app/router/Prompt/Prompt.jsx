import React, { useEffect } from "react";
import qs from "query-string";
import { HashRouter, Route, Routes, useNavigate } from "react-router-dom";
import { parsePaymentRequest } from "invoices";

import "./styles.scss";

import utils from "../../../common/lib/utils";
import Unlock from "../../screens/Unlock";
import Enable from "../../screens/Enable";
import Loading from "../../components/Loading";
import ConfirmPayment from "../../screens/ConfirmPayment";
import LNURLPay from "../../screens/LNURLPay";
import LNURLAuth from "../../screens/LNURLAuth";

function GateKeeping({ next }) {
  const navigate = useNavigate();

  useEffect(() => {
    utils.call("isUnlocked").then((response) => {
      if (response.unlocked) {
        navigate(next, { replace: true });
      } else {
        navigate("/unlock", { replace: true });
      }
    });
  }, []);

  return <Loading />;
}

class Prompt extends React.Component {
  constructor(props) {
    super(props);
    const message = qs.parse(window.location.search);
    let origin = {};
    let args = {};
    let invoice = {};
    if (message.origin) {
      origin = JSON.parse(message.origin);
    }
    if (message.args) {
      args = JSON.parse(message.args);
      if (args.paymentRequest) {
        invoice = parsePaymentRequest({ request: args.paymentRequest });
      }
    }
    this.state = { origin, args, invoice, type: message.type };
  }

  render() {
    return (
      <HashRouter>
        <section id="prompt">
          <Routes>
            <Route
              path="/"
              element={<GateKeeping next={`/${this.state.type}`} />}
            />
            <Route
              path="unlock"
              element={<Unlock next={`/${this.state.type}`} />}
            />
            <Route
              path="enable"
              element={<Enable origin={this.state.origin} />}
            />
            <Route
              path="lnurlPay"
              element={
                <LNURLPay
                  details={this.state.args?.lnurlDetails}
                  origin={this.state.origin}
                />
              }
            />
            <Route
              path="lnurlAuth"
              element={
                <LNURLAuth
                  details={this.state.args?.lnurlDetails}
                  origin={this.state.origin}
                />
              }
            />
            <Route
              path="confirmPayment"
              element={
                <ConfirmPayment
                  invoice={this.state.invoice}
                  paymentRequest={this.state.args?.paymentRequest}
                  origin={this.state.origin}
                />
              }
            />
          </Routes>
        </section>
      </HashRouter>
    );
  }
}

export default Prompt;
