import PinExtension from "@screens/Onboard/PinExtension";
import SetPassword from "@screens/Onboard/SetPassword";
import TestConnection from "@screens/Onboard/TestConnection";
import ChooseConnector from "@screens/connectors/ChooseConnector";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteObject } from "react-router";
import { HashRouter as Router, useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Container from "~/app/components/Container";
import { SettingsProvider } from "~/app/context/SettingsContext";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import AlbyWallet from "~/app/screens/connectors/AlbyWallet";
import ChooseConnectorPath from "~/app/screens/connectors/ChooseConnectorPath";
import i18n from "~/i18n/i18nConfig";

const connectorRoutes = getConnectorRoutes();

function getRoutes(
  connectorRoutes: {
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
): RouteObject[] {
  return [
    {
      path: "/",
      element: <SetPassword />,
    },
    {
      path: "/choose-path",
      children: [
        {
          index: true,
          element: (
            <ChooseConnectorPath
              title={i18n.t("translation:choose_path.title")}
              description={i18n.t("translation:choose_path.description")}
            />
          ),
        },
        {
          path: "create",
          element: <AlbyWallet variant="create" />,
        },
        {
          path: "login",
          element: <AlbyWallet variant="login" />,
        },
        {
          path: "choose-connector",
          children: [
            {
              index: true,
              element: (
                <ChooseConnector
                  title={i18n.t("translation:choose_connector.title")}
                  description={i18n.t(
                    "translation:choose_connector.description"
                  )}
                />
              ),
            },
            ...connectorRoutes,
          ],
        },
      ],
    },
    {
      path: "/test-connection",
      element: <TestConnection />,
    },
    {
      path: "/pin-extension",
      element: <PinExtension />,
    },
  ];
}

const routes = getRoutes(connectorRoutes);

function WelcomeRouter() {
  return (
    <SettingsProvider>
      <Router>
        <ToastContainer
          autoClose={15000}
          hideProgressBar={true}
          className="w-fit max-w-2xl"
        />
        <App />
      </Router>
    </SettingsProvider>
  );
}

function App() {
  const { t } = useTranslation();
  const routesElement = useRoutes(routes);

  const [languageChanged, setLanguageChanged] = useState(false);
  i18n.on("languageChanged", () => {
    // Trigger rerender to update displayed language
    setLanguageChanged(!languageChanged);
  });

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center font-serif font-medium text-2xl my-14 dark:text-white">
          <p>
            {t("welcome.title")}
            <img
              src="assets/icons/alby_icon_yellow.svg"
              alt="Alby"
              className="dark:hidden inline align-middle w-6 ml-2"
            />
            <img
              src="assets/icons/alby_icon_yellow_dark.svg"
              alt="Alby"
              className="hidden dark:inline align-middle w-6 ml-2"
            />
          </p>
        </div>
      </div>
      <Container maxWidth="xl">{routesElement}</Container>
    </div>
  );
}

export default WelcomeRouter;
