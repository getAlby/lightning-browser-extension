import Container from "@components/Container";
import Navbar from "@components/Navbar";
import Accounts from "@screens/Accounts";
import ConfirmPayment from "@screens/ConfirmPayment";
import Keysend from "@screens/Keysend";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLChannel from "@screens/LNURLChannel";
import LNURLPay from "@screens/LNURLPay";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import TestConnection from "@screens/Options/TestConnection";
import Publisher from "@screens/Publisher";
import Publishers from "@screens/Publishers";
import Receive from "@screens/Receive";
import Send from "@screens/Send";
import Settings from "@screens/Settings";
import Unlock from "@screens/Unlock";
import ChooseConnector from "@screens/connectors/ChooseConnector";
import { useTranslation } from "react-i18next";
import { HashRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Providers from "~/app/context/Providers";
import RequireAuth from "~/app/router/RequireAuth";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import i18n from "~/i18n/i18nConfig";
import {
  translationI18nNamespace,
  commonI18nNamespace,
} from "~/i18n/namespaces";

function Options() {
  const connectorRoutes = getConnectorRoutes();

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
            <Route index element={<Navigate to="/publishers" replace />} />
            <Route path="publishers">
              <Route path=":id" element={<Publisher />} />
              <Route index element={<Publishers />} />
            </Route>
            <Route path="send" element={<Send />} />
            <Route path="confirmPayment" element={<ConfirmPayment />} />
            <Route path="keysend" element={<Keysend />} />
            <Route path="receive" element={<Receive />} />
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route path="lnurlChannel" element={<LNURLChannel />} />
            <Route path="lnurlWithdraw" element={<LNURLWithdraw />} />
            <Route path="lnurlAuth" element={<LNURLAuth />} />
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
                    <ChooseConnector
                      title={i18n.t(
                        "choose_connector.title.options",
                        translationI18nNamespace
                      )}
                    />
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
          <Route
            path="unlock"
            element={
              <>
                <Unlock />
                <ToastContainer />
              </>
            }
          />
        </Routes>
      </HashRouter>
    </Providers>
  );
}

const Layout = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Navbar>
        <Navbar.Link href="/publishers">
          {t("websites", commonI18nNamespace)}
        </Navbar.Link>
        <Navbar.Link href="/send">
          {t("actions.send", commonI18nNamespace)}
        </Navbar.Link>
        <Navbar.Link href="/receive">
          {t("actions.receive", commonI18nNamespace)}
        </Navbar.Link>
        <Navbar.Link href="/settings">
          {t("settings", commonI18nNamespace)}
        </Navbar.Link>
      </Navbar>
      <ToastContainer />

      <Outlet />
    </div>
  );
};

export default Options;
