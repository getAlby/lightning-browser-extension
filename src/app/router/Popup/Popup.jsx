import { HashRouter, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import Home from "../../screens/Home";
import Unlock from "../../screens/Unlock";
import Send from "../../screens/Send";
import Receive from "../../screens/Receive";
import LNURLPay from "../../screens/LNURLPay";
import ConfirmPayment from "../../screens/ConfirmPayment";

import { AuthProvider } from "../../context/AuthContext";
import RequireAuth from "../RequireAuth";
import Navbar from "../../components/Navbar";

function Popup() {
  return (
    <AuthProvider>
      <HashRouter>
        <section id="popup">
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
        </section>
      </HashRouter>
    </AuthProvider>
  );
}

const Layout = () => {
  const auth = useAuth();

  return (
    <div>
      <Navbar
        title={auth.account?.alias}
        subtitle={
          typeof auth.account?.balance === "number"
            ? `${auth.account.balance} sat`
            : ""
        }
        onAccountSwitch={auth.getAccountInfo}
      />

      <Outlet />
    </div>
  );
};

export default Popup;
