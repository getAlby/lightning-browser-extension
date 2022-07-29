import AccountMenu from "@components/AccountMenu";
import Keysend from "@screens/ConfirmKeysend";
import ConfirmPayment from "@screens/ConfirmPayment";
import ConfirmSignMessage from "@screens/ConfirmSignMessage";
import Enable from "@screens/Enable";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLPay from "@screens/LNURLPay";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import MakeInvoice from "@screens/MakeInvoice";
import Unlock from "@screens/Unlock";
import { HashRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { AccountProvider } from "~/app/context/AccountContext";
import { AccountsProvider } from "~/app/context/AccountsContext";
import { SettingsProvider } from "~/app/context/SettingsContext";
import RequireAuth from "~/app/router/RequireAuth";
import type {
  LNURLAuthServiceResponse,
  LNURLPayServiceResponse,
  LNURLWithdrawServiceResponse,
  OriginData,
  RequestInvoiceArgs,
} from "~/types";

// Parse out the parameters from the querystring.
const params = new URLSearchParams(window.location.search);
let origin = {} as OriginData;
let args = {};
let action = "";

if (params.get("origin") && typeof params.get("origin") === "string") {
  origin = JSON.parse(params.get("origin") as string);
}

if (params.get("args") && typeof params.get("args") === "string") {
  args = JSON.parse(params.get("args") as string);
}

if (typeof params.get("action") === "string")
  action = params.get("action") as string;

const routeParams: {
  origin: OriginData;
  args: Record<string, unknown>;
  action: string;
} = { origin, args, action };

function Prompt() {
  return (
    <SettingsProvider>
      <AccountProvider>
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
                  element={<Navigate to={`/${routeParams.action}`} replace />}
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
                        routeParams.args
                          ?.lnurlDetails as LNURLAuthServiceResponse
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
                        routeParams.args
                          ?.lnurlDetails as LNURLPayServiceResponse
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
                      amountEditable={
                        routeParams.args.amountEditable as boolean
                      }
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
                      paymentRequest={
                        routeParams.args?.paymentRequest as string
                      }
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
                        routeParams.args?.customRecords as Record<
                          string,
                          string
                        >
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
      </AccountProvider>
    </SettingsProvider>
  );
}

const Layout = () => {
  const { account, balancesDecorated } = useAccount();

  return (
    <>
      <ToastContainer />
      <div className="px-4 py-2 bg-white flex border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
        <AccountMenu
          title={
            typeof account?.name === "string"
              ? `${account?.name} - ${account?.alias}`.substring(0, 21)
              : ""
          }
          showOptions={false}
          balances={balancesDecorated}
        />
      </div>

      <main className="flex flex-col grow min-h-0">
        <Outlet />
      </main>
    </>
  );
};

export default Prompt;
