import { HashRouter, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "~/app/context/AuthContext";
import Home from "@screens/Home";
import Unlock from "@screens/Unlock";
import Send from "@screens/Send";
import Receive from "@screens/Receive";
import LNURLPay from "@screens/LNURLPay";
import ConfirmPayment from "@screens/ConfirmPayment";
import { AuthProvider } from "~/app/context/AuthContext";
import { AccountsProvider } from "~/app/context/AccountsContext";
import RequireAuth from "../RequireAuth";
import Navbar from "@components/Navbar";
import Keysend from "@screens/Keysend";
import { CurrencyProvider, useCurreny } from "~/app/context/CurrencyContext";

const POPUP_MAX_HEIGHT = 600;

function Popup() {
  return (
    <AuthProvider>
      <AccountsProvider>
        <CurrencyProvider>
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
        </CurrencyProvider>
      </AccountsProvider>
    </AuthProvider>
  );
}

const Layout = () => {
  const auth = useAuth();
  const { balances } = useCurreny();

  return (
    <div className="flex flex-col" style={{ height: `${POPUP_MAX_HEIGHT}px` }}>
      <Navbar
        title={
          typeof auth.account?.name === "string"
            ? `${auth.account?.name} - ${auth.account?.alias}`.substring(0, 21)
            : ""
        }
        subtitle={balances}
      />

      <main className="overflow-y-auto grow">
        <Outlet />
      </main>
    </div>
  );
};

export default Popup;
