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
import RequireAuth from "~/app/router/RequireAuth";
import Unlock from "@screens/Unlock";
import Enable from "@screens/Enable";
import MakeInvoice from "@screens/MakeInvoice";
import ConfirmSignMessage from "@screens/ConfirmSignMessage";
import ConfirmPayment from "@screens/ConfirmPayment";
import LNURLPay from "@screens/LNURLPay";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import Keysend from "@screens/ConfirmKeysend";
import AccountMenu from "@components/AccountMenu";

// Parse out the parameters from the querystring.
const params = new URLSearchParams(window.location.search);
let origin = {} as OriginData;
let args = {};
let type = "";
if (params.get("origin") && typeof params.get("origin") === "string") {
  origin = JSON.parse(params.get("origin") as string);
}
if (params.get("args") && typeof params.get("args") === "string") {
  args = JSON.parse(params.get("args") as string);
}
if (typeof params.get("type") === "string") type = params.get("type") as string;
const routeParams: {
  origin: OriginData;
  args: Record<string, unknown>;
  type: string;
} = { origin, args, type };

function Prompt() {
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
                element={<Navigate to={`/${routeParams.type}`} replace />}
              />
              <Route
                path="webln/enable"
                element={<Enable origin={routeParams.origin} />}
              />
              <Route
                path="lnurlAuth"
                element={
                  <LNURLAuth
                    details={
                      routeParams.args?.lnurlDetails as LNURLAuthServiceResponse
                    }
                    origin={routeParams.origin}
                  />
                }
              />
              <Route
                path="lnurlPay"
                element={
                  <LNURLPay
                    details={
                      routeParams.args?.lnurlDetails as LNURLPayServiceResponse
                    }
                    origin={routeParams.origin}
                  />
                }
              />
              <Route
                path="lnurlWithdraw"
                element={
                  <LNURLWithdraw
                    details={
                      routeParams.args
                        ?.lnurlDetails as LNURLWithdrawServiceResponse
                    }
                    origin={routeParams.origin}
                  />
                }
              />
              <Route
                path="makeInvoice"
                element={
                  <MakeInvoice
                    amountEditable={routeParams.args.amountEditable as boolean}
                    memoEditable={routeParams.args.memoEditable as boolean}
                    invoiceAttributes={
                      routeParams.args.invoiceAttributes as RequestInvoiceArgs
                    }
                    origin={routeParams.origin}
                  />
                }
              />
              <Route
                path="confirmPayment"
                element={
                  <ConfirmPayment
                    paymentRequest={routeParams.args?.paymentRequest as string}
                    origin={routeParams.origin}
                  />
                }
              />
              <Route
                path="confirmKeysend"
                element={
                  <Keysend
                    destination={routeParams.args?.destination as string}
                    valueSat={routeParams.args?.amount as string}
                    customRecords={
                      routeParams.args?.customRecords as Record<string, string>
                    }
                    origin={routeParams.origin}
                  />
                }
              />
              <Route
                path="confirmSignMessage"
                element={
                  <ConfirmSignMessage
                    message={routeParams.args?.message as string}
                    origin={routeParams.origin}
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

const Layout = () => {
  const auth = useAuth();

  return (
    <>
      <div className="px-4 py-2 bg-white flex border-b border-gray-200 dark:bg-surface-02dp dark:border-gray-500">
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
