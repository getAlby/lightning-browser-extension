import type { Step } from "@components/Steps";
import Steps from "@components/Steps";
import SetPassword from "@screens/Onboard/SetPassword";
import TestConnection from "@screens/Onboard/TestConnection";
import ChooseConnector from "@screens/connectors/ChooseConnector";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HashRouter as Router, useRoutes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { SettingsProvider } from "~/app/context/SettingsContext";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import i18n from "~/i18n/i18nConfig";

const connectorRoutes = getConnectorRoutes();

function getRoutes(
  connectorRoutes: {
    path: string;
    element: JSX.Element;
    title: string;
    description: string;
    logo: string;
  }[]
) {
  return [
    {
      path: "/",
      element: <SetPassword />,
      name: i18n.t("translation:welcome.nav.password"),
    },
    {
      path: "/choose-connector",
      name: i18n.t("translation:welcome.nav.connect"),
      children: [
        {
          index: true,
          element: (
            <ChooseConnector
              title={i18n.t("translation:choose_connector.title.welcome")}
              description={i18n.t("translation:choose_connector.description")}
            />
          ),
        },
        ...connectorRoutes,
      ],
    },
    {
      path: "/test-connection",
      element: <TestConnection />,
      name: i18n.t("translation:welcome.nav.done"),
    },
  ];
}

const routes = getRoutes(connectorRoutes);

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
      if (index === activeStepIndex) {
        status = "current";
      } else if (index < activeStepIndex) {
        status = "complete";
      }
      return { ...step, status };
    });
    setSteps(updatedSteps);
  }, [location, languageChanged]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center font-serif font-medium text-2xl pt-7 pb-3 dark:text-white">
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

        <Steps steps={steps} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {routesElement}
      </div>
    </div>
  );
}

export default WelcomeRouter;
