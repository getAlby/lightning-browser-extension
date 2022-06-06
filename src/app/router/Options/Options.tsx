import Container from "@components/Container";
import Navbar from "@components/Navbar";
import Accounts from "@screens/Accounts";
import ConfirmPayment from "@screens/ConfirmPayment";
import Keysend from "@screens/Keysend";
import LNURLPay from "@screens/LNURLPay";
import TestConnection from "@screens/Options/TestConnection";
import Publisher from "@screens/Publisher";
import Publishers from "@screens/Publishers";
import Receive from "@screens/Receive";
import Send from "@screens/Send";
import Settings from "@screens/Settings";
import Unlock from "@screens/Unlock";
import ChooseConnector from "@screens/connectors/ChooseConnector";
import { useState, useEffect } from "react";
import { HashRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AccountsProvider } from "~/app/context/AccountsContext";
import { AuthProvider, useAuth } from "~/app/context/AuthContext";
import RequireAuth from "~/app/router/RequireAuth";
import connectorRoutes from "~/app/router/connectorRoutes";
import { getBalances } from "~/common/utils/currencyConvert";

function Options() {
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
              <Route index element={<Navigate to="/publishers" replace />} />
              <Route path="publishers">
                <Route path=":id" element={<Publisher />} />
                <Route index element={<Publishers />} />
              </Route>
              <Route path="send" element={<Send />} />
              <Route path="keysend" element={<Keysend />} />
              <Route path="receive" element={<Receive />} />
              <Route path="lnurlPay" element={<LNURLPay />} />
              <Route path="confirmPayment" element={<ConfirmPayment />} />
              <Route path="settings" element={<Settings />} />
              <Route path="accounts">
                <Route
                  path="new"
                  element={
                    <Container>
                      <Outlet />
                    </Container>
                  }
                >
                  <Route
                    index
                    element={
                      <ChooseConnector title="Add a new lightning account" />
                    }
                  />
                  {connectorRoutes.map((connectorRoute) => (
                    <Route
                      key={connectorRoute.path}
                      path={connectorRoute.path}
                      element={connectorRoute.element}
                    />
                  ))}
                </Route>
                <Route index element={<Accounts />} />
              </Route>
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
      </AccountsProvider>
    </AuthProvider>
  );
}

const Layout = () => {
  const auth = useAuth();
  const [balances, setBalances] = useState<{
    satsBalance: string;
    fiatBalance: string;
  }>({ satsBalance: "", fiatBalance: "" });

  useEffect(() => {
    if (typeof auth.account?.balance === "number") {
      getBalances(auth.account?.balance).then((balances) =>
        setBalances(balances)
      );
    }
  }, [auth.account?.balance]);

  return (
    <div>
      <Navbar
        title={
          typeof auth.account?.name === "string"
            ? `${auth.account?.name} - ${auth.account?.alias}`.substring(0, 21)
            : ""
        }
        subtitle={balances}
      >
        <Navbar.Link href="/publishers">Websites</Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
        <Navbar.Link href="/settings">Settings</Navbar.Link>
      </Navbar>
      <ToastContainer />

      <Outlet />
    </div>
  );
};

export default Options;
