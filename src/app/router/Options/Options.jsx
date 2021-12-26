import { Fragment, useState } from "react";
import { HashRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";
import RequireAuth from "../RequireAuth";
import Container from "../../components/Container";
import Navbar from "../../components/Navbar";
import Publishers from "../../screens/Publishers";
import Publisher from "../../screens/Publisher";
import ChooseConnector from "../../screens/Options/ChooseConnector";
import TestConnection from "../../screens/Options/TestConnection";
import Send from "../../screens/Send";
import ConfirmPayment from "../../screens/ConfirmPayment";
import Receive from "../../screens/Receive";
import LNURLPay from "../../screens/LNURLPay";
import Settings from "../../screens/Settings";
import Unlock from "../../screens/Unlock";

function Options() {
  return (
    <AuthProvider>
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
            <Route index element={<Navigate to="/publishers" replace />} />
            <Route path="publishers">
              <Route path=":id" element={<Publisher />} />
              <Route index element={<Publishers />} />
            </Route>
            <Route path="send" element={<Send />} />
            <Route path="receive" element={<Receive />} />
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route path="confirmPayment" element={<ConfirmPayment />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="accounts/new/*"
              element={
                <Container>
                  <ChooseConnector />
                </Container>
              }
            />
            <Route
              path="test-connection"
              element={
                <Container>
                  <TestConnection />
                </Container>
              }
            />
          </Route>
          <Route path="unlock" element={<Unlock />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

const Layout = () => {
  const auth = useAuth();
  const [key, setKey] = useState(Date.now());

  return (
    <div>
      <Navbar
        title={auth.account?.alias}
        subtitle={
          typeof auth.account?.balance === "number"
            ? `${auth.account.balance} sat`
            : ""
        }
        onAccountSwitch={() => {
          auth.getAccountInfo();

          // TODO: this should be done in an eloquent way.
          setKey(Date.now()); // Refresh screens.
        }}
      >
        <Navbar.Link href="/publishers">Websites</Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
        <Navbar.Link href="/settings">Settings</Navbar.Link>
      </Navbar>

      <Fragment key={key}>
        <Outlet />
      </Fragment>
    </div>
  );
};

export default Options;
