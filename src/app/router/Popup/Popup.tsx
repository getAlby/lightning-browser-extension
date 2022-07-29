import Navbar from "@components/Navbar";
import ConfirmPayment from "@screens/ConfirmPayment";
import Home from "@screens/Home";
import Keysend from "@screens/Keysend";
import LNURLPay from "@screens/LNURLPay";
import Receive from "@screens/Receive";
import Send from "@screens/Send";
import Unlock from "@screens/Unlock";
import { HashRouter, Outlet, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { AccountProvider } from "~/app/context/AccountContext";
import { AccountsProvider } from "~/app/context/AccountsContext";
import { SettingsProvider } from "~/app/context/SettingsContext";

import RequireAuth from "../RequireAuth";

function Popup() {
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
                <Route index element={<Home />} />
                <Route path="send" element={<Send />} />
                <Route path="receive" element={<Receive />} />
                <Route path="lnurlPay" element={<LNURLPay />} />
                <Route path="keysend" element={<Keysend />} />
                <Route path="confirmPayment" element={<ConfirmPayment />} />
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
    <div className="flex flex-col h-full">
      <Navbar
        title={
          typeof account?.name === "string"
            ? `${account?.name} - ${account?.alias}`.substring(0, 21)
            : ""
        }
        balances={balancesDecorated}
      />

      <main className="flex flex-col grow min-h-0">
        <Outlet />
        <ToastContainer />
      </main>
    </div>
  );
};

export default Popup;
