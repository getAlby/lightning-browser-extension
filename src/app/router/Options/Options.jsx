import React from "react";
import { HashRouter, Switch, Route, Link } from "react-router-dom";

import AppBar from "../../components/Appbar";

import Publishers from "../../screens/Publishers";

class Options extends React.Component {
  render() {
    return (
      <HashRouter>
        <AppBar
          title="myNode"
          subtitle="₿ 0.0016 7930   €33.57"
          onOptionsClick={() => alert("options clicked")}
        >
          <ul className="flex space-x-8">
            <li>
              <Link className="underline" to="/">
                Publishers
              </Link>
            </li>
            <li>
              <Link className="underline" to="/screen-2">
                Screen 2
              </Link>
            </li>
            <li>
              <Link className="underline" to="/screen-3">
                Screen 3
              </Link>
            </li>
          </ul>
        </AppBar>

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
