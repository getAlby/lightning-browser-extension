import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import DevMenu from "../../components/DevMenu";
import Steps from "../../components/steps";
import Intro from "../../screens/Onboard/Intro";
import SetPassword from "../../screens/Onboard/SetPassword";

const steps = [
  { id: "Step 1", name: "Job details", href: "#", status: "complete" },
  { id: "Step 2", name: "Application form", href: "#", status: "current" },
  { id: "Step 3", name: "Preview", href: "#", status: "upcoming" },
];

function Welcome() {
  return (
    <Router>
      <div>
        <DevMenu />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Steps steps={steps} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Switch>
            <Route exact path="/">
              <Intro />
            </Route>
            <Route path="/set-password">
              <SetPassword />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default Welcome;
