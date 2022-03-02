import { Component } from "react";
import qs from "query-string";
import { HashRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";

import type {
  LNURLAuthServiceResponse,
  LNURLPayServiceResponse,
  OriginData,
  RequestInvoiceArgs,
} from "../../../types";
import { AuthProvider } from "../../context/AuthContext";
import RequireAuth from "../RequireAuth";
import Unlock from "../../screens/Unlock";
import Enable from "../../screens/Enable";
import MakeInvoice from "../../screens/MakeInvoice";
import ConfirmSignMessage from "../../screens/ConfirmSignMessage";
import ConfirmPayment from "../../screens/ConfirmPayment";
import LNURLPay from "../../screens/LNURLPay";
import LNURLAuth from "../../screens/LNURLAuth";

class Prompt extends Component<
  Record<string, unknown>,
  { origin: OriginData; args: Record<string, unknown>; type: string }
> {
  constructor(props: Record<string, unknown>) {
    super(props);
    const message = qs.parse(window.location.search);
    let origin = {} as OriginData;
    let args = {};
    let type = "";
    if (message.origin && typeof message.origin === "string") {
      origin = JSON.parse(message.origin);
    }
    if (message.args && typeof message.args === "string") {
      args = JSON.parse(message.args);
    }
    if (typeof message.type === "string") type = message.type;
    this.state = { origin, args, type };
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
                    details={
                      this.state.args?.lnurlDetails as LNURLPayServiceResponse
                    }
                    origin={this.state.origin}
                  />
                }
              />
              <Route
                path="lnurlAuth"
                element={
                  <LNURLAuth
                    details={
                      this.state.args?.lnurlDetails as LNURLAuthServiceResponse
                    }
                    origin={this.state.origin}
                  />
                }
              />
              <Route
                path="makeInvoice"
                element={
                  <MakeInvoice
                    invoiceAttributes={
                      this.state.args.invoiceAttributes as RequestInvoiceArgs
                    }
                    origin={this.state.origin}
                  />
                }
              />
              <Route
                path="confirmPayment"
                element={
                  <ConfirmPayment
                    paymentRequest={this.state.args?.paymentRequest as string}
                    origin={this.state.origin}
                  />
                }
              />
              <Route
                path="confirmSignMessage"
                element={
                  <ConfirmSignMessage
                    message={this.state.args?.message as string}
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
