import { HashRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";

import { AuthProvider } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";
import connectorRoutes from "../connectorRoutes";

import RequireAuth from "../RequireAuth";
import Container from "../../components/Container";
import Navbar from "../../components/Navbar";
import Publishers from "../../screens/Publishers";
import Publisher from "../../screens/Publisher";
import TestConnection from "../../screens/Options/TestConnection";
import Send from "../../screens/Send";
import ConfirmPayment from "../../screens/ConfirmPayment";
import Receive from "../../screens/Receive";
import LNURLPay from "../../screens/LNURLPay";
import Settings from "../../screens/Settings";
import Unlock from "../../screens/Unlock";
import ChooseConnector from "../../screens/Onboard/ChooseConnector";

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
              path="accounts/new"
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

  return (
    <div>
      <Navbar
        title={auth.account?.alias}
        subtitle={
          typeof auth.account?.balance === "number"
            ? `${auth.account.balance} sat`
            : ""
        }
      >
        <Navbar.Link href="/publishers">Websites</Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
        <Navbar.Link href="/settings">Settings</Navbar.Link>
      </Navbar>

      <Outlet />
    </div>
  );
};

export default Options;
