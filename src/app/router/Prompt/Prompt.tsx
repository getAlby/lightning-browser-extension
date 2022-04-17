import { Component } from "react";
import qs from "query-string";
import { HashRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";

import { useAuth } from "~/app/context/AuthContext";
import type {
  LNURLAuthServiceResponse,
  LNURLPayServiceResponse,
  LNURLWithdrawServiceResponse,
  OriginData,
  RequestInvoiceArgs,
} from "~/types";
import { AuthProvider } from "~/app/context/AuthContext";
import { AccountsProvider } from "~/app/context/AccountsContext";
import RequireAuth from "../RequireAuth";
import Unlock from "~/app/screens/Unlock";
import Enable from "~/app/screens/Enable";
import MakeInvoice from "~/app/screens/MakeInvoice";
import ConfirmSignMessage from "~/app/screens/ConfirmSignMessage";
import ConfirmPayment from "~/app/screens/ConfirmPayment";
import LNURLPay from "~/app/screens/LNURLPay";
import LNURLAuth from "~/app/screens/LNURLAuth";
import LNURLWithdraw from "~/app/screens/LNURLWithdraw";
import Keysend from "~/app/screens/ConfirmKeysend";
import AccountMenu from "~/app/components/AccountMenu";

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
        <AccountsProvider>
          <HashRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Layout />
                  </RequireAuth>
                }
              >
                <Route
                  index
                  element={<Navigate to={`/${this.state.type}`} replace />}
                />
                <Route
                  path="webln/enable"
                  element={<Enable origin={this.state.origin} />}
                />
                <Route
                  path="lnurlAuth"
                  element={
                    <LNURLAuth
                      details={
                        this.state.args
                          ?.lnurlDetails as LNURLAuthServiceResponse
                      }
                      origin={this.state.origin}
                    />
                  }
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
                  path="lnurlWithdraw"
                  element={
                    <LNURLWithdraw
                      details={
                        this.state.args
                          ?.lnurlDetails as LNURLWithdrawServiceResponse
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
                  path="confirmKeysend"
                  element={
                    <Keysend
                      destination={this.state.args?.destination as string}
                      valueSat={this.state.args?.amount as string}
                      customRecords={
                        this.state.args?.customRecords as Record<string, string>
                      }
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
        </AccountsProvider>
      </AuthProvider>
    );
  }
}

const Layout = () => {
  const auth = useAuth();

  return (
    <>
      <div className="px-4 py-2 bg-white flex border-b border-gray-200 dark:bg-gray-800 dark:border-gray-500">
        <AccountMenu
          title={
            typeof auth.account?.name === "string"
              ? `${auth.account?.name} - ${auth.account?.alias}`.substring(
                  0,
                  21
                )
              : ""
          }
          subtitle={
            typeof auth.account?.balance === "number"
              ? `${auth.account.balance} sat`
              : ""
          }
          showOptions={false}
        />
      </div>

      <Outlet />
    </>
  );
};

export default Prompt;
