import AccountMenu from "@components/AccountMenu";
import ConfirmAddAccount from "@screens/ConfirmAddAccount";
import ConfirmKeysend from "@screens/ConfirmKeysend";
import ConfirmPayment from "@screens/ConfirmPayment";
import ConfirmRequestPermission from "@screens/ConfirmRequestPermission";
import ConfirmSignMessage from "@screens/ConfirmSignMessage";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLChannel from "@screens/LNURLChannel";
import LNURLPay from "@screens/LNURLPay";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import LiquidConfirmGetAddress from "@screens/Liquid/ConfirmGetAddress";
import ConfirmSignPset from "@screens/Liquid/ConfirmSignPset";
import MakeInvoice from "@screens/MakeInvoice";
import NostrConfirmGetPublicKey from "@screens/Nostr/ConfirmGetPublicKey";
import NostrConfirmSignMessage from "@screens/Nostr/ConfirmSignMessage";
import NostrConfirmSignSchnorr from "@screens/Nostr/ConfirmSignSchnorr";
import Unlock from "@screens/Unlock";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AlbyLogo from "~/app/components/AlbyLogo";
import Toaster from "~/app/components/Toast/Toaster";
import Providers from "~/app/context/Providers";
import RequireAuth from "~/app/router/RequireAuth";
import BitcoinConfirmGetAddress from "~/app/screens/Bitcoin/ConfirmGetAddress";
import ConfirmSignPsbt from "~/app/screens/Bitcoin/ConfirmSignPsbt";
import ConfirmPaymentAsync from "~/app/screens/ConfirmPaymentAsync";
import AlbyEnable from "~/app/screens/Enable/AlbyEnable";
import LiquidEnable from "~/app/screens/Enable/LiquidEnable";
import NostrEnable from "~/app/screens/Enable/NostrEnable";
import WebbtcEnable from "~/app/screens/Enable/WebbtcEnable";
import WeblnEnable from "~/app/screens/Enable/WeblnEnable";
import NostrConfirmDecrypt from "~/app/screens/Nostr/ConfirmDecrypt";
import NostrConfirmEncrypt from "~/app/screens/Nostr/ConfirmEncrypt";
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
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route
              path="public/alby/enable"
              element={
                <AlbyEnable origin={navigationState.origin as OriginData} />
              } // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/webln/enable"
              element={
                <WeblnEnable origin={navigationState.origin as OriginData} />
              } // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/liquid/enable"
              element={
                <LiquidEnable origin={navigationState.origin as OriginData} />
              } // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/nostr/enable"
              element={
                <NostrEnable origin={navigationState.origin as OriginData} />
              } // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
            />
            <Route
              path="public/webbtc/enable"
              element={
                <WebbtcEnable origin={navigationState.origin as OriginData} />
              } // prompt will always have an `origin` set, just the type is optional to support usage via PopUp
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
            <Route
              path="public/nostr/confirmEncrypt"
              element={<NostrConfirmEncrypt />}
            />
            <Route
              path="public/nostr/confirmDecrypt"
              element={<NostrConfirmDecrypt />}
            />
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
            <Route
              path="confirmPaymentAsync"
              element={<ConfirmPaymentAsync />}
            />
            <Route path="confirmKeysend" element={<ConfirmKeysend />} />
            <Route path="confirmSignMessage" element={<ConfirmSignMessage />} />
            <Route path="confirmAddAccount" element={<ConfirmAddAccount />} />
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
                <Toaster />
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
      <Toaster />
      <div className="px-4 py-2 justify-between items-center bg-white flex border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-700 gap-5">
        <div className="w-24 shrink-0">
          <AlbyLogo />
        </div>
        <AccountMenu showOptions={false} />
      </div>
      <main className="flex flex-col grow">
        <Outlet />
      </main>
    </>
  );
};

export default Prompt;
