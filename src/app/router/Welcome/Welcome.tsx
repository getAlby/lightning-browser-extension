import type { Step } from "@components/Steps";
import Steps from "@components/Steps";
import Intro from "@screens/Onboard/Intro";
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

let connectorRoutes = getConnectorRoutes();

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
      element: <Intro />,
      name: i18n.t("translation:welcome.nav.welcome"),
    },
    {
      path: "/set-password",
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {routesElement}
      </div>
    </div>
  );
}

export default WelcomeRouter;
