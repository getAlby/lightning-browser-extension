import type { Step } from "@components/Steps";
import Steps from "@components/Steps";
import Intro from "@screens/Onboard/Intro";
import SetPassword from "@screens/Onboard/SetPassword";
import TestConnection from "@screens/Onboard/TestConnection";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HashRouter as Router, useLocation, useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Container from "~/app/components/Container";
import { SettingsProvider } from "~/app/context/SettingsContext";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import ChooseConnector from "~/app/screens/connectors/ChooseConnector";
import ChooseConnectorPath from "~/app/screens/connectors/ChooseConnectorPath";
import NewWallet from "~/app/screens/connectors/NewWallet";
import i18n from "~/i18n/i18nConfig";

let connectorRoutes = getConnectorRoutes();

function getRoutes(
  connectorRoutes: {
    path: string;
    element: JSX.Element;
    title: string;
    logo: string;
  }[]
) {
  return [
    {
      path: "/",
      element: <Intro />,
      name: i18n.t("translation:welcome.nav.welcome"),
    },
    {
      path: "/set-password",
      element: <SetPassword />,
      name: i18n.t("translation:welcome.nav.password"),
    },
    {
      path: "/choose-path",
      name: i18n.t("translation:welcome.nav.connect"),
      children: [
        {
          index: true,
          element: (
            <ChooseConnectorPath
              title={i18n.t("translation:choose_path.title")}
              description={i18n.t(
                "translation:welcome.choose_path.description"
              )}
            />
          ),
        },
        {
          path: "create-wallet",
          element: <NewWallet />,
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
      name: i18n.t("translation:welcome.nav.done"),
    },
  ];
}

let routes = getRoutes(connectorRoutes);

const initialSteps: Step[] = routes.map((route) => ({
  id: route.name,
  status: "upcoming",
}));

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
  const [steps, setSteps] = useState(initialSteps);
  const { t } = useTranslation();
  const location = useLocation();
  const routesElement = useRoutes(routes);

  const [languageChanged, setLanguageChanged] = useState(false);
  i18n.on("languageChanged", () => {
    connectorRoutes = getConnectorRoutes();
    routes = getRoutes(connectorRoutes);

    // Update name to new language only, don't update status
    const tempSteps: Step[] = [];
    routes.forEach((_, i) => {
      tempSteps.push({
        id: routes[i].name,
        status: steps[i].status,
      });
    });
    setSteps(tempSteps);

    // Trigger rerender to update displayed language
    setLanguageChanged(!languageChanged);
  });

  // Update step progress based on active location.
  useEffect(() => {
    const { pathname } = location;
    let activeStepIndex = 0;
    routes.forEach((route, index) => {
      if (pathname.includes(route.path)) activeStepIndex = index;
    });
    const updatedSteps = initialSteps.map((step, index) => {
      let status: Step["status"] = "upcoming";
      if (index < activeStepIndex) {
        status = "complete";
      } else if (index === activeStepIndex) {
        status = "current";
      }
      return { ...step, status };
    });
    setSteps(updatedSteps);
  }, [location]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center font-serif font-medium text-2xl pt-7 pb-3 dark:text-white">
          <p>{t("welcome.title")}</p>
        </div>

        <Steps steps={steps} />
      </div>
      <Container maxWidth="xl">{routesElement}</Container>
    </div>
  );
}

export default WelcomeRouter;
