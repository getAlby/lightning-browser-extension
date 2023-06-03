import Container from "@components/Container";
import Navbar from "@components/Navbar";
import Accounts from "@screens/Accounts";
import AccountDetail from "@screens/Accounts/Detail";
import ConfirmPayment from "@screens/ConfirmPayment";
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
import Providers from "~/app/context/Providers";
import RequireAuth from "~/app/router/RequireAuth";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import Discover from "~/app/screens/Discover";
import ChooseConnector from "~/app/screens/connectors/ChooseConnector";
import ChooseConnectorPath from "~/app/screens/connectors/ChooseConnectorPath";
import i18n from "~/i18n/i18nConfig";

function renderRoutes(
  routes:
    | {
        path: string;
        element?: JSX.Element;
        title: string;
        logo: string;
        children?: {
          index?: boolean;
          element: JSX.Element;
          path?: string;
        }[];
      }[]
    | {
        index?: boolean;
        element: JSX.Element;
        path?: string;
      }[]
) {
  return routes.map((route) => {
    if ("children" in route && route.children) {
      if ("element" in route && route.element) {
        return (
          <Route key={route.path} path={route.path}>
            <Route index element={route.element} />
            {renderRoutes(route.children)}
          </Route>
        );
      } else {
        let indexRoute;
        const indexRouteIndex = route.children.findIndex(
          (childRoute) => childRoute.index === true
        );

        if (indexRouteIndex !== -1) {
          indexRoute = route.children.splice(indexRouteIndex, 1)[0];
          return (
            <Route key={route.path} path={route.path}>
              <Route index element={indexRoute.element} />
              {renderRoutes(route.children)}
            </Route>
          );
        }
      }
    } else {
      return (
        <Route key={route.path} path={route.path} element={route.element} />
      );
    }
  });
}

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
            <Route path="transactions" element={<Transactions />} />
            <Route path="lnurlPay" element={<LNURLPay />} />
            <Route path="lnurlChannel" element={<LNURLChannel />} />
            <Route path="lnurlWithdraw" element={<LNURLWithdraw />} />
            <Route path="lnurlAuth" element={<LNURLAuth />} />
            <Route path="settings" element={<Settings />} />
            <Route path="accounts">
              <Route path=":id" element={<AccountDetail />} />
              <Route
                path="new"
                element={
                  <Container maxWidth="xl">
                    <Outlet />
                  </Container>
                }
              >
                <Route
                  index
                  element={
                    <ChooseConnectorPath
                      title={i18n.t("translation:choose_path.title")}
                      description={i18n.t(
                        "translation:choose_path.description"
                      )}
                    />
                  }
                />

                <Route path="choose-connector">
                  <Route
                    index
                    element={
                      <ChooseConnector
                        title={i18n.t("translation:choose_connector.title")}
                        description={i18n.t(
                          "translation:choose_connector.description"
                        )}
                      />
                    }
                  />
                  {renderRoutes(connectorRoutes)}
                </Route>
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
        <Navbar.Link href="/send">{tCommon("actions.send")}</Navbar.Link>
        <Navbar.Link href="/receive">{tCommon("actions.receive")}</Navbar.Link>
        <Navbar.Link href="/transactions">
          {tCommon("actions.transactions")}
        </Navbar.Link>
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
