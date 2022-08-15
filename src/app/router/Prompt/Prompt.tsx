import AccountMenu from "@components/AccountMenu";
import ConfirmKeysend from "@screens/ConfirmKeysend";
import ConfirmPayment from "@screens/ConfirmPayment";
import ConfirmSignMessage from "@screens/ConfirmSignMessage";
import Enable from "@screens/Enable";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLChannel from "@screens/LNURLChannel";
import LNURLPay from "@screens/LNURLPay";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import MakeInvoice from "@screens/MakeInvoice";
import Unlock from "@screens/Unlock";
import { HashRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Providers from "~/app/context/Providers";
import RequireAuth from "~/app/router/RequireAuth";
import type {
  NavigationState,
  LNURLAuthServiceResponse,
  LNURLWithdrawServiceResponse,
  RequestInvoiceArgs,
} from "~/types";

// Parse out the parameters from the querystring.
const params = new URLSearchParams(window.location.search);

const getParamValues = (params: URLSearchParams, key: string) => {
  const valueFromKey = params.get(key);
  if (!!valueFromKey && typeof valueFromKey === "string") {
    try {
      return JSON.parse(valueFromKey as string);
    } catch (e) {
      // not valid JSON, let's return only the string
      return valueFromKey;
    }
  }
};

const createStateFromParams = (params: URLSearchParams): NavigationState => ({
  origin: getParamValues(params, "origin"),
  args: getParamValues(params, "args") || {}, // important: args can be null
  action: getParamValues(params, "action"),
  isPrompt: true,
});

const navigationState = createStateFromParams(params);

function Prompt() {
  return (
    <Providers>
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
              element={
                <Navigate
                  to={`/${navigationState.action}`}
                  replace
                  // no need to check for serializable data for the navState here,
                  // navState does not fail when data is coming via a LNURL called by webLn
                  // as all data in deep nested object are serializable in this case
                  state={navigationState}
                />
              }
            />
            <Route
              path="webln/enable"
              element={<Enable origin={navigationState.origin} />}
            />
            <Route
              path="lnurlAuth"
              element={
                <LNURLAuth
                  details={
                    navigationState.args
                      ?.lnurlDetails as LNURLAuthServiceResponse
                  }
                  origin={navigationState.origin}
                />
              }
            />
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route
              path="lnurlWithdraw"
              element={
                <LNURLWithdraw
                  details={
                    navigationState.args
                      ?.lnurlDetails as LNURLWithdrawServiceResponse
                  }
                  origin={navigationState.origin}
                />
              }
            />
            <Route path="lnurlChannel" element={<LNURLChannel />} />
            <Route
              path="makeInvoice"
              element={
                <MakeInvoice
                  amountEditable={
                    navigationState.args?.amountEditable as boolean
                  }
                  memoEditable={navigationState.args?.memoEditable as boolean}
                  invoiceAttributes={
                    navigationState.args
                      ?.invoiceAttributes as RequestInvoiceArgs
                  }
                  origin={navigationState.origin}
                />
              }
            />
            <Route
              path="confirmPayment"
              element={
                <ConfirmPayment
                  paymentRequest={
                    navigationState.args?.paymentRequest as string
                  }
                  origin={navigationState.origin}
                />
              }
            />
            <Route
              path="confirmKeysend"
              element={
                <ConfirmKeysend
                  destination={navigationState.args?.destination as string}
                  valueSat={navigationState.args?.amount as string}
                  customRecords={
                    navigationState.args?.customRecords as Record<
                      string,
                      string
                    >
                  }
                  origin={navigationState.origin}
                />
              }
            />
            <Route
              path="confirmSignMessage"
              element={
                <ConfirmSignMessage
                  message={navigationState.args?.message as string}
                  origin={navigationState.origin}
                />
              }
            />
          </Route>
          <Route path="unlock" element={<Unlock />} />
        </Routes>
      </HashRouter>
    </Providers>
  );
}

const Layout = () => {
  return (
    <>
      <ToastContainer />
      <div className="px-4 py-2 bg-white flex border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
        <AccountMenu showOptions={false} />
      </div>

      <main className="flex flex-col grow min-h-0">
        <Outlet />
      </main>
    </>
  );
};

export default Prompt;
