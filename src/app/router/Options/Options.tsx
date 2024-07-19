import Container from "@components/Container";
import Navbar from "@components/Navbar";
import { PopiconsArrowUpLine } from "@popicons/react";
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
import AccountDetailLayout from "~/app/components/AccountDetailLayout";
import ScrollToTop from "~/app/components/ScrollToTop";
import Toaster from "~/app/components/Toast/Toaster";
import Providers from "~/app/context/Providers";
import RequireAuth from "~/app/router/RequireAuth";
import { getConnectorRoutes, renderRoutes } from "~/app/router/connectorRoutes";
import BackupMnemonic from "~/app/screens/Accounts/BackupMnemonic";
import GenerateMnemonic from "~/app/screens/Accounts/GenerateMnemonic";
import NewMnemonic from "~/app/screens/Accounts/GenerateMnemonic/new";
import ImportMnemonic from "~/app/screens/Accounts/ImportMnemonic";
import NostrSettings from "~/app/screens/Accounts/NostrSettings";

import LNURLRedeem from "~/app/screens/LNURLRedeem";
import OnChainReceive from "~/app/screens/OnChainReceive";
import ReceiveInvoice from "~/app/screens/ReceiveInvoice";
import ScanQRCode from "~/app/screens/ScanQRCode";
import SendToBitcoinAddress from "~/app/screens/SendToBitcoinAddress";
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
            <Route index element={<Navigate to="/wallet" replace />} />
            <Route path="publishers">
              <Route path=":id" element={<PublisherDetail />} />
              <Route index element={<Publishers />} />
            </Route>
            <Route path="send" element={<Send />} />
            <Route path="confirmPayment" element={<ConfirmPayment />} />
            <Route path="keysend" element={<Keysend />} />
            <Route
              path="sendToBitcoinAddress"
              element={<SendToBitcoinAddress />}
            />
            <Route path="receive" element={<Receive />} />
            <Route path="receive/invoice" element={<ReceiveInvoice />} />
            <Route path="onChainReceive" element={<OnChainReceive />} />
            <Route path="wallet" element={<DefaultView />} />
            <Route path="transactions" element={<Transactions />} />
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
                <Route path="secret-key/backup" element={<BackupMnemonic />} />
                <Route
                  path="secret-key/generate"
                  element={<GenerateMnemonic />}
                />
                <Route path="secret-key/new" element={<NewMnemonic />} />
                <Route path="secret-key/import" element={<ImportMnemonic />} />
                <Route path="nostr/settings" element={<NostrSettings />} />
              </Route>

              <Route
                path="new"
                element={
                  <div className="flex flex-1 justify-center items-center">
                    <Container maxWidth="xl">
                      <Outlet />
                    </Container>
                  </div>
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
  const { t: tCommon } = useTranslation("common");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar>
        <Navbar.Link href="/wallet">{tCommon("wallet")}</Navbar.Link>
        <Navbar.Link href="/publishers">
          {tCommon("connected_sites")}
        </Navbar.Link>
        <Navbar.Link href="https://getalby.com/discover" target="_blank">
          {tCommon("discover")}
          <PopiconsArrowUpLine className="h-5 w-5 rotate-45" />
        </Navbar.Link>
      </Navbar>
      <Toaster />
      <Outlet />
    </div>
  );
};

export default Options;
