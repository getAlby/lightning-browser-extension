import React from "react";
import qs from "query-string";
import { HashRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import { parsePaymentRequest } from "invoices";

import "./styles.scss";

import { AuthProvider } from "../../context/AuthContext";
import RequireAuth from "../RequireAuth";
import Unlock from "../../screens/Unlock";
import Enable from "../../screens/Enable";
import ConfirmPayment from "../../screens/ConfirmPayment";
import LNURLPay from "../../screens/LNURLPay";
import LNURLAuth from "../../screens/LNURLAuth";

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
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Outlet />
                </RequireAuth>
              }
            >
              <Route
                index
                element={<Navigate to={`/${this.state.type}`} replace />}
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
            </Route>
            <Route path="unlock" element={<Unlock />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    );
  }
}

export default Prompt;
