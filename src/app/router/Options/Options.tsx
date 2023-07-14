import Container from "@components/Container";
import Navbar from "@components/Navbar";
import Accounts from "@screens/Accounts";
import AccountDetail from "@screens/Accounts/Detail";
import ConfirmPayment from "@screens/ConfirmPayment";
import DefaultView from "@screens/Home/DefaultView";
import Keysend from "@screens/Keysend";
import LNURLAuth from "@screens/LNURLAuth";
import LNURLChannel from "@screens/LNURLChannel";
import LNURLPay from "@screens/LNURLPay";
import LNURLWithdraw from "@screens/LNURLWithdraw";
import TestConnection from "@screens/Options/TestConnection";
import Publishers from "@screens/Publishers";
import PublisherDetail from "@screens/Publishers/Detail";
import Receive from "@screens/Receive";
import Send from "@screens/Send";
import Settings from "@screens/Settings";
import Transactions from "@screens/Transactions";
import Unlock from "@screens/Unlock";
import { useTranslation } from "react-i18next";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AccountDetailLayout from "~/app/components/AccountDetailLayout";
import ScrollToTop from "~/app/components/ScrollToTop";
import Providers from "~/app/context/Providers";
import RequireAuth from "~/app/router/RequireAuth";
import { getConnectorRoutes, renderRoutes } from "~/app/router/connectorRoutes";
import BackupSecretKey from "~/app/screens/Accounts/BackupSecretKey";
import GenerateSecretKey from "~/app/screens/Accounts/GenerateSecretKey";
import ImportSecretKey from "~/app/screens/Accounts/ImportSecretKey";
import NostrSettings from "~/app/screens/Accounts/NostrSettings";
import Discover from "~/app/screens/Discover";
import LNURLRedeem from "~/app/screens/LNURLRedeem";
import OnChainReceive from "~/app/screens/OnChainReceive";
import ScanQRCode from "~/app/screens/ScanQRCode";
import ChooseConnector from "~/app/screens/connectors/ChooseConnector";
import ChooseConnectorPath from "~/app/screens/connectors/ChooseConnectorPath";
import i18n from "~/i18n/i18nConfig";

function Options() {
  const connectorRoutes = getConnectorRoutes();

  return (
    <Providers>
      <HashRouter>
        <ScrollToTop />
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
            <Route path="discover">
              <Route index element={<Discover />} />
            </Route>
            <Route path="publishers">
              <Route path=":id" element={<PublisherDetail />} />
              <Route index element={<Publishers />} />
            </Route>
            <Route path="send" element={<Send />} />
            <Route path="confirmPayment" element={<ConfirmPayment />} />
            <Route path="keysend" element={<Keysend />} />
            <Route path="receive" element={<Receive />} />
            <Route path="onChainReceive" element={<OnChainReceive />} />
            <Route path="wallet" element={<DefaultView />} />
            <Route path="transactions">
              <Route
                path="outgoing"
                element={<Transactions type="outgoing" />}
              />
              <Route
                path="incoming"
                element={<Transactions type="incoming" />}
              />
            </Route>
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route path="lnurlChannel" element={<LNURLChannel />} />
            <Route path="lnurlWithdraw" element={<LNURLWithdraw />} />
            <Route path="lnurlRedeem" element={<LNURLRedeem />} />
            <Route path="lnurlAuth" element={<LNURLAuth />} />
            <Route path="settings" element={<Settings />} />
            <Route path="scanQRCode" element={<ScanQRCode />} />
            <Route path="accounts">
              <Route index element={<Accounts />} />
              <Route path=":id" element={<AccountDetailLayout />}>
                <Route index element={<AccountDetail />} />
                <Route path="secret-key/backup" element={<BackupSecretKey />} />
                <Route
                  path="secret-key/generate"
                  element={<GenerateSecretKey />}
                />
                <Route path="secret-key/import" element={<ImportSecretKey />} />
                <Route path="nostr" element={<NostrSettings />} />
              </Route>

              <Route
                path="new"
                element={
                  <Container maxWidth="xl">
                    <Outlet />
                  </Container>
                }
              >
                <Route index={true} element={<ChooseConnectorPath />}></Route>
                <Route index element={<ChooseConnectorPath />} />

                <Route path="choose-connector">
                  <Route
                    index
                    element={
                      <ChooseConnector
                        title={i18n.t("translation:choose_connector.title")}
                        description={i18n.t(
                          "translation:choose_connector.description"
                        )}
                        connectorRoutes={connectorRoutes}
                      />
                    }
                  />
                  {renderRoutes(connectorRoutes)}
                </Route>
              </Route>
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
  const { t: tCommon } = useTranslation("common");

  return (
    <div>
      <Navbar>
        <Navbar.Link href="/discover">{tCommon("discover")}</Navbar.Link>
        <Navbar.Link href="/publishers">
          {tCommon("connected_sites")}
        </Navbar.Link>
        <Navbar.Link href="/wallet">{tCommon("wallet")}</Navbar.Link>
      </Navbar>
      <ToastContainer
        autoClose={15000}
        hideProgressBar={true}
        className="w-fit max-w-2xl"
      />

      <Outlet />
    </div>
  );
};

export default Options;
