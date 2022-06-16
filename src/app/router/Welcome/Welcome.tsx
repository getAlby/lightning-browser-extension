import { useEffect, useState } from "react";
import { HashRouter as Router, useRoutes, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n/i18nConfig";

import { AuthProvider } from "~/app/context/AuthContext";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import type { Step } from "@components/Steps";
import DevMenu from "@components/DevMenu";
import LocaleSwitcher from "@components/LocaleSwitcher/LocaleSwitcher";
import Steps from "@components/Steps";
import Intro from "@screens/Onboard/Intro";
import SetPassword from "@screens/Onboard/SetPassword";
import TestConnection from "@screens/Onboard/TestConnection";
import ChooseConnector from "@screens/connectors/ChooseConnector";
import { welcomeI18nNamespace } from "~/i18n/namespaces";

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
      name: i18n.t("nav.welcome", welcomeI18nNamespace),
    },
    {
      path: "/set-password",
      element: <SetPassword />,
      name: i18n.t("nav.password", welcomeI18nNamespace),
    },
    {
      path: "/choose-connector",
      name: i18n.t("nav.connect", welcomeI18nNamespace),
      children: [
        {
          index: true,
          element: (
            <ChooseConnector
              title={i18n.t("choose_connector.title", welcomeI18nNamespace)}
              description={i18n.t(
                "choose_connector.description",
                welcomeI18nNamespace
              )}
            />
          ),
        },
        ...connectorRoutes,
      ],
    },
    {
      path: "/test-connection",
      element: <TestConnection />,
      name: i18n.t("nav.done", welcomeI18nNamespace),
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
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [steps, setSteps] = useState(initialSteps);
  const { t } = useTranslation(["welcome"]);
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
    <AuthProvider>
      <div>
        {process.env.NODE_ENV === "development" && (
          <>
            <DevMenu />
            <div className="w-32 mr-4 mt-1 pt-3 float-right">
              <LocaleSwitcher />
            </div>
          </>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center font-serif font-medium text-2xl pt-7 pb-3 dark:text-white">
            <p>{t("heading")}</p>
          </div>

          <Steps steps={steps} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {routesElement}
        </div>
      </div>
    </AuthProvider>
  );
}

export default WelcomeRouter;
