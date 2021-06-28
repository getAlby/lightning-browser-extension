import React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";

import Navbar from "../../components/Navbar";

import Publishers from "../../screens/Publishers";

class Options extends React.Component {
  render() {
    return (
      <HashRouter>
        <Navbar
          title="myNode"
          subtitle="₿ 0.0016 7930   €33.57"
          onOptionsClick={() => alert("options clicked")}
        >
          <Navbar.Link exact href="/">
            Publishers
          </Navbar.Link>
          <Navbar.Link href="/screen-2">Screen 2</Navbar.Link>
          <Navbar.Link href="/screen-3">Screen 3</Navbar.Link>
        </Navbar>

        <div className="container mx-auto px-4">
          <Switch>
            <Route exact path="/">
              <Publishers />
            </Route>
            <Route path="/screen-2">
              <h2 className="mt-12 mb-6 text-2xl font-bold">Screen 2</h2>
              <p>Test content</p>
            </Route>
            <Route path="/screen-3">
              <h2 className="mt-12 mb-6 text-2xl font-bold">Screen 3</h2>
              <p>Lorem ipsum</p>
            </Route>
          </Switch>
        </div>
      </HashRouter>
    );
  }
}

export default Options;
