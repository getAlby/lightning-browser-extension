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
import { HashRouter, Outlet, Route, Routes } from "react-router-dom";
import Toaster from "~/app/components/Toast/Toaster";
import Providers from "~/app/context/Providers";
import LNURLRedeem from "~/app/screens/LNURLRedeem";
import OnChainReceive from "~/app/screens/OnChainReceive";
import ReceiveInvoice from "~/app/screens/ReceiveInvoice";
import ScanQRCode from "~/app/screens/ScanQRCode";
import SendToBitcoinAddress from "~/app/screens/SendToBitcoinAddress";
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
            <Route path="scanQRCode" element={<ScanQRCode />} />
            <Route path="receive" element={<Receive />} />
            <Route path="onChainReceive" element={<OnChainReceive />} />
            <Route path="receive/invoice" element={<ReceiveInvoice />} />
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route path="lnurlChannel" element={<LNURLChannel />} />
            <Route path="lnurlWithdraw" element={<LNURLWithdraw />} />
            <Route path="lnurlRedeem" element={<LNURLRedeem />} />
            <Route path="keysend" element={<Keysend />} />
            <Route path="confirmPayment" element={<ConfirmPayment />} />
            <Route path="lnurlAuth" element={<LNURLAuth />} />
            <Route
              path="sendToBitcoinAddress"
              element={<SendToBitcoinAddress />}
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
    <div className="flex flex-col h-full">
      <Navbar />

      <main className="flex flex-col grow">
        <Outlet />
        <Toaster />
      </main>
    </div>
  );
};

export default Popup;
