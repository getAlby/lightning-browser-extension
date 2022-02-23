import { HashRouter, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import Home from "../../screens/Home";
import Unlock from "../../screens/Unlock";
import Send from "../../screens/Send";
import Receive from "../../screens/Receive";
import LNURLPay from "../../screens/LNURLPay";
import ConfirmPayment from "../../screens/ConfirmPayment";

import { AuthProvider } from "../../context/AuthContext";
import { AccountsProvider } from "../../context/AccountsContext";
import RequireAuth from "../RequireAuth";
import Navbar from "../../components/Navbar";

const POPUP_MAX_HEIGHT = 600;

function Popup() {
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
              <Route index element={<Home />} />
              <Route path="send" element={<Send />} />
              <Route path="receive" element={<Receive />} />
              <Route path="lnurlPay" element={<LNURLPay />} />
              <Route path="confirmPayment" element={<ConfirmPayment />} />
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
    <div className="flex flex-col" style={{ height: `${POPUP_MAX_HEIGHT}px` }}>
      <Navbar
        title={auth.account?.alias || ""}
        subtitle={
          typeof auth.account?.balance === "number"
            ? `${auth.account.balance} sat`
            : ""
        }
      />

      <div className="overflow-y-auto grow">
        <Outlet />
      </div>
    </div>
  );
};

export default Popup;
