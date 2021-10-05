import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  useLocation,
} from "react-router-dom";

import DevMenu from "../../components/DevMenu";
import Steps from "../../components/Steps";
import Intro from "../../screens/Onboard/Intro";
import SetPassword from "../../screens/Onboard/SetPassword";
import ChooseConnector from "../../screens/Onboard/ChooseConnector";
import TestConnection from "../../screens/Onboard/TestConnection";

const routes = [
  { path: "/", component: Intro, exact: true, name: "Welcome" },
  { path: "/set-password", component: SetPassword, name: "Your Password" },
  {
    path: "/choose-connector",
    component: ChooseConnector,
    name: "Connect to Lightning",
  },
  { path: "/test-connection", component: TestConnection, name: "Done" },
];

const initialSteps = routes.map((route, index) => ({
  id: route.name,
  status: "upcoming",
}));

function RouteWithSubRoutes(route) {
  return (
    <Route
      path={route.path}
      render={(props) => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

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
        <Steps steps={steps} />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Switch>
          {routes.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} />
          ))}
        </Switch>
      </div>
    </div>
  );
}

export default WelcomeRouter;
