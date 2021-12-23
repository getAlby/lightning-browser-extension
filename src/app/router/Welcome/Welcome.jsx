import { useEffect, useState } from "react";
import { HashRouter as Router, useRoutes, useLocation } from "react-router-dom";

import DevMenu from "../../components/DevMenu";
import Steps from "../../components/Steps";
import Intro from "../../screens/Onboard/Intro";
import SetPassword from "../../screens/Onboard/SetPassword";
import ChooseConnector from "../../screens/Onboard/ChooseConnector";
import TestConnection from "../../screens/Onboard/TestConnection";
import ConnectLnd from "../../screens/Onboard/ConnectLnd";
import ConnectLndHub from "../../screens/Onboard/ConnectLndHub";
import ConnectLnbits from "../../screens/Onboard/ConnectLnbits";
import NewWallet from "../../screens/Onboard/NewWallet";

const routes = [
  { path: "/", element: <Intro />, name: "Welcome" },
  { path: "/set-password", element: <SetPassword />, name: "Your Password" },
  {
    path: "/choose-connector",
    name: "Connect to Lightning",
    children: [
      { index: true, element: <ChooseConnector /> },
      { path: "lnd", element: <ConnectLnd /> },
      { path: "lnd-hub", element: <ConnectLndHub /> },
      { path: "lnbits", element: <ConnectLnbits /> },
      { path: "create-wallet", element: <NewWallet /> },
    ],
  },
  { path: "/test-connection", element: <TestConnection />, name: "Done" },
];

const initialSteps = routes.map((route) => ({
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
  let location = useLocation();
  const routesElement = useRoutes(routes);

  // Update step progress based on active location.
  useEffect(() => {
    const { pathname } = location;
    let activeStepIndex = 0;
    routes.forEach((route, index) => {
      if (pathname.includes(route.path)) activeStepIndex = index;
    });
    const updatedSteps = initialSteps.map((step, index) => {
      let status = "upcoming";
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
      {process.env.NODE_ENV === "development" && <DevMenu />}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center font-serif font-medium text-2xl pt-7 pb-3 dark:text-white">
          <p>The power of lightning in your browser</p>
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
