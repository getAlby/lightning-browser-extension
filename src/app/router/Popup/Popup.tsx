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
import { AccountsProvider } from "~/app/context/AccountsContext";
import { useAuth } from "~/app/context/AuthContext";
import { AccountProvider } from "~/app/context/AuthContext";

import RequireAuth from "../RequireAuth";

function Popup() {
  return (
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
  );
}

const Layout = () => {
  const { account, balancesDecorated } = useAuth();

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
