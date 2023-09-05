import AccountMenu from "@components/AccountMenu";
import ConfirmAddAccount from "@screens/ConfirmAddAccount";
import ConfirmKeysend from "@screens/ConfirmKeysend";
import ConfirmPayment from "@screens/ConfirmPayment";
import ConfirmRequestPermission from "@screens/ConfirmRequestPermission";
import ConfirmSignMessage from "@screens/ConfirmSignMessage";
import Enable from "@screens/Enable";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLChannel from "@screens/LNURLChannel";
import LNURLPay from "@screens/LNURLPay";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import LiquidConfirmGetAddress from "@screens/Liquid/ConfirmGetAddress";
import ConfirmSignPset from "@screens/Liquid/ConfirmSignPset";
import MakeInvoice from "@screens/MakeInvoice";
import NostrConfirm from "@screens/Nostr/Confirm";
import NostrConfirmGetPublicKey from "@screens/Nostr/ConfirmGetPublicKey";
import NostrConfirmSignMessage from "@screens/Nostr/ConfirmSignMessage";
import NostrConfirmSignSchnorr from "@screens/Nostr/ConfirmSignSchnorr";
import Unlock from "@screens/Unlock";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AlbyLogo from "~/app/components/AlbyLogo";
import Providers from "~/app/context/Providers";
import RequireAuth from "~/app/router/RequireAuth";
import BitcoinConfirmGetAddress from "~/app/screens/Bitcoin/ConfirmGetAddress";
import ConfirmSignPsbt from "~/app/screens/Bitcoin/ConfirmSignPsbt";
import Onboard from "~/app/screens/Onboard/Prompt";
import type { NavigationState, OriginData } from "~/types";

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
                  state={navigationState}
                />
              }
            />
            <Route
              path="public/alby/enable"
              element={<Enable origin={navigationState.origin as OriginData} />} // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/webln/enable"
              element={<Enable origin={navigationState.origin as OriginData} />} // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/liquid/enable"
              element={<Enable origin={navigationState.origin as OriginData} />} // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/nostr/enable"
              element={<Enable origin={navigationState.origin as OriginData} />} // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/webbtc/enable"
              element={<Enable origin={navigationState.origin as OriginData} />} // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/webbtc/confirmGetAddress"
              element={<BitcoinConfirmGetAddress />}
            />
            <Route
              path="webbtc/confirmSignPsbt"
              element={<ConfirmSignPsbt />}
            />
            <Route
              path="public/liquid/confirmGetAddress"
              element={<LiquidConfirmGetAddress />}
            />
            <Route
              path="public/liquid/confirmSignPset"
              element={<ConfirmSignPset />}
            />
            <Route path="public/nostr/confirm" element={<NostrConfirm />} />
            <Route
              path="public/nostr/confirmGetPublicKey"
              element={<NostrConfirmGetPublicKey />}
            />
            <Route
              path="public/nostr/confirmSignMessage"
              element={<NostrConfirmSignMessage />}
            />
            <Route
              path="public/nostr/confirmSignSchnorr"
              element={<NostrConfirmSignSchnorr />}
            />

            <Route path="lnurlAuth" element={<LNURLAuth />} />
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route path="lnurlWithdraw" element={<LNURLWithdraw />} />
            <Route path="lnurlChannel" element={<LNURLChannel />} />
            <Route path="makeInvoice" element={<MakeInvoice />} />
            <Route path="confirmPayment" element={<ConfirmPayment />} />
            <Route path="confirmKeysend" element={<ConfirmKeysend />} />
            <Route path="confirmSignMessage" element={<ConfirmSignMessage />} />
            <Route path="confirmAddAccount" element={<ConfirmAddAccount />} />
            <Route path="public/nostr/onboard" element={<Onboard />} />
            <Route path="public/liquid/onboard" element={<Onboard />} />
            <Route path="public/webbtc/onboard" element={<Onboard />} />
            <Route
              path="public/confirmRequestPermission"
              element={<ConfirmRequestPermission />}
            />
          </Route>
          <Route
            path="unlock"
            element={
              <>
                <Unlock />
                <ToastContainer autoClose={10000} hideProgressBar={true} />
              </>
            }
          />
        </Routes>
      </HashRouter>
    </Providers>
  );
}

const Layout = () => {
  return (
    <>
      <ToastContainer autoClose={10000} hideProgressBar={true} />
      <div className="px-4 py-2 justify-between items-center bg-white flex border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500 gap-5">
        <div className="w-24 shrink-0">
          <AlbyLogo />
        </div>
        <AccountMenu showOptions={false} />
      </div>

      <main className="flex flex-col grow min-h-0">
        <Outlet />
      </main>
    </>
  );
};

export default Prompt;
