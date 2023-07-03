import ConnectionError from "@components/ConnectionError";
import Navbar from "@components/Navbar";
import ConfirmPayment from "@screens/ConfirmPayment";
import Home from "@screens/Home";
import Keysend from "@screens/Keysend";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLChannel from "@screens/LNURLChannel";
import LNURLPay from "@screens/LNURLPay";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import Receive from "@screens/Receive";
import Send from "@screens/Send";
import Unlock from "@screens/Unlock";
import { useEffect, useState } from "react";
import { HashRouter, Outlet, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import Providers from "~/app/context/Providers";
import OnChainReceive from "~/app/screens/OnChainReceive";

import RequireAuth from "../RequireAuth";

function Popup() {
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
            <Route index element={<Home />} />
            <Route path="send" element={<Send />} />
            <Route path="receive" element={<Receive />} />
            <Route path="onChainReceive" element={<OnChainReceive />} />
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route path="lnurlChannel" element={<LNURLChannel />} />
            <Route path="lnurlWithdraw" element={<LNURLWithdraw />} />
            <Route path="keysend" element={<Keysend />} />
            <Route path="confirmPayment" element={<ConfirmPayment />} />
            <Route path="lnurlAuth" element={<LNURLAuth />} />
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
  const { account } = useAccount();
  // keep last tries result, to prevent component flick during loading state
  const [lastAccountFailed, setLastAccountFailed] = useState<boolean>(false);

  useEffect(() => {
    // skip the state during loading phase where only the id is present
    if (Object.prototype.hasOwnProperty.call(account, "name")) {
      setLastAccountFailed(!!account?.error);
    }
  }, [setLastAccountFailed, account]);

  return (
    <div className="flex flex-col h-full">
      <Navbar />

      <main className="flex flex-col grow min-h-0">
        {lastAccountFailed || account?.error ? <ConnectionError /> : <Outlet />}
        <ToastContainer autoClose={10000} hideProgressBar={true} />
      </main>
    </div>
  );
};

export default Popup;
