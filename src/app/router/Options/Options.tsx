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
import { HashRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AccountProvider, useAccount } from "~/app/context/AccountContext";
import { AccountsProvider } from "~/app/context/AccountsContext";
import { SettingsProvider } from "~/app/context/SettingsContext";
import RequireAuth from "~/app/router/RequireAuth";
import getConnectorRoutes from "~/app/router/connectorRoutes";

function Options() {
  const connectorRoutes = getConnectorRoutes();
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
      </AccountProvider>
    </SettingsProvider>
  );
}

const Layout = () => {
  const { account, balancesDecorated } = useAccount();

  return (
    <div>
      <Navbar
        title={
          typeof account?.name === "string"
            ? `${account?.name} - ${account?.alias}`.substring(0, 21)
            : ""
        }
        balances={balancesDecorated}
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
