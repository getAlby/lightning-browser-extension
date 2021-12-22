import { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import DevMenu from "../../components/DevMenu";
import Steps from "../../components/Steps";
import Intro from "../../screens/Onboard/Intro";
import SetPassword from "../../screens/Onboard/SetPassword";
import ChooseConnector from "../../screens/Onboard/ChooseConnector";
import ConnectLnd from "../../screens/Onboard/ConnectLnd";
import TestConnection from "../../screens/Onboard/TestConnection";

const routes = [
  { path: "/", component: Intro, name: "Welcome" },
  { path: "/set-password", component: SetPassword, name: "Your Password" },
  {
    path: "/choose-connector/*",
    component: ChooseConnector,
    name: "Connect to Lightning",
  },
  { path: "/test-connection", component: TestConnection, name: "Done" },
];

const initialSteps = routes.map((route, index) => ({
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
        <div className="text-center font-serif  font-medium text-2xl pt-7 pb-3 ">
          <p>The power of lightning in your browser</p>
        </div>

        <Steps steps={steps} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Routes>
          {routes.map((route, i) => (
            <Route
              key={i}
              path={route.path}
              element={<route.component routes={route.routes} />}
            />
          ))}
        </Routes>
      </div>
    </div>
  );
}

export default WelcomeRouter;
