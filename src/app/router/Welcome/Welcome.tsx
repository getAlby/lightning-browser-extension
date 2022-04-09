import { useEffect, useState } from "react";
import { HashRouter as Router, useRoutes, useLocation } from "react-router-dom";

import connectorRoutes from "../connectorRoutes";
import type { Step } from "../../components/Steps";

import DevMenu from "../../components/DevMenu";
import Steps from "../../components/Steps";
import Intro from "../../screens/Onboard/Intro";
import SetPassword from "../../screens/Onboard/SetPassword";
import ChooseConnector from "../../screens/connectors/ChooseConnector";
import TestConnection from "../../screens/Onboard/TestConnection";
import { useTranslation } from "react-i18next";
import LocaleSwitcher from "../../components/LocaleSwitcher/LocaleSwitcher";

const routes = [
  { path: "/", element: <Intro />, name: "Welcome" },
  { path: "/set-password", element: <SetPassword />, name: "Your Password" },
  {
    path: "/choose-connector",
    name: "Connect to Lightning",
    children: [
      {
        index: true,
        element: (
          <ChooseConnector
            title="Do you have a lightning wallet?"
            description="You need to first connect to a lightning wallet so that you can interact with your favorite websites that accept bitcoin lightning payments!"
          />
        ),
      },
      ...connectorRoutes,
    ],
  },
  { path: "/test-connection", element: <TestConnection />, name: "Done" },
];

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
          <p>{t("heading") as string}</p>
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
