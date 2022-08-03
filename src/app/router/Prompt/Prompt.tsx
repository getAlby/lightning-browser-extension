import AccountMenu from "@components/AccountMenu";
import Keysend from "@screens/ConfirmKeysend";
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
  LNURLPayServiceResponse,
  LNURLWithdrawServiceResponse,
  LNURLChannelServiceResponse,
  RequestInvoiceArgs, // MessageWebLnEnable,
  // MessageLnUrlAuth,
} from "~/types";
import { MessageWebLnEnable, MessageLnUrlAuth } from "~/types";

// Parse out the parameters from the querystring.
const params = new URLSearchParams(window.location.search);
let origin;
let args;
let action;

const tmpOrigin = params.get("origin");
if (typeof tmpOrigin === "string") {
  origin = JSON.parse(tmpOrigin);
}

const tmpArgs = params.get("args");
if (typeof tmpArgs === "string") {
  args = JSON.parse(tmpArgs);
}

const tmpAction = params.get("action");
if (typeof tmpAction === "string") {
  action = tmpAction;
}

if (action === undefined) {
  throw new Error("no message");
}

const message: MessageWebLnEnable | MessageLnUrlAuth = {
  origin,
  args,
  action,
};

function Prompt() {
  console.log("MESSAGE", message);

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
                <Navigate to={`/${message.action}`} replace state={message} />
              }
            />
            <Route path="webln/enable" element={<Enable />} />
            <Route path="lnurlAuth" element={<LNURLAuth />} />
            <Route
              path="lnurlPay"
              element={
                <LNURLPay
                // details={
                //   routeParams.args?.lnurlDetails as LNURLPayServiceResponse
                // }
                // origin={routeParams.origin}
                />
              }
            />
            <Route
              path="lnurlWithdraw"
              element={
                <LNURLWithdraw
                // details={
                //   routeParams.args
                //     ?.lnurlDetails as LNURLWithdrawServiceResponse
                // }
                // origin={routeParams.origin}
                />
              }
            />
            <Route
              path="LNURLChannel"
              element={
                <LNURLChannel
                // details={
                //   routeParams.args
                //     ?.lnurlDetails as LNURLChannelServiceResponse
                // }
                // origin={routeParams.origin}
                />
              }
            />
            <Route
              path="makeInvoice"
              element={
                <MakeInvoice
                // amountEditable={routeParams.args.amountEditable as boolean}
                // memoEditable={routeParams.args.memoEditable as boolean}
                // invoiceAttributes={
                //   routeParams.args.invoiceAttributes as RequestInvoiceArgs
                // }
                // origin={routeParams.origin}
                />
              }
            />
            <Route
              path="confirmPayment"
              element={
                <ConfirmPayment
                // paymentRequest={routeParams.args?.paymentRequest as string}
                // origin={routeParams.origin}
                />
              }
            />
            <Route
              path="confirmKeysend"
              element={
                <Keysend
                // destination={routeParams.args?.destination as string}
                // valueSat={routeParams.args?.amount as string}
                // customRecords={
                //   routeParams.args?.customRecords as Record<string, string>
                // }
                // origin={routeParams.origin}
                />
              }
            />
            <Route
              path="confirmSignMessage"
              element={
                <ConfirmSignMessage
                // message={routeParams.args?.message as string}
                // origin={routeParams.origin}
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
