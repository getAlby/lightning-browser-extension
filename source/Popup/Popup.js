import React from "react";
import { createHashHistory } from "history";
import { HashRouter, Switch, Route } from "react-router-dom";

import utils from "../lib/utils";
import Home from "../pages/home";
import Unlock from "../pages/unlock";
import Loading from "../pages/loading";

import "./styles.scss";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
  }

  componentDidMount() {
    utils.call("isUnlocked").then((response) => {
      if (response.unlocked) {
        this.history.replace("/home");
      } else {
        this.history.replace("/unlock");
      }
    });
  }

  render() {
    return (
      <HashRouter>
        <section id="popup">
          <Switch>
            <Route exact path="/" render={(props) => <Loading />} />
            <Route exact path="/home" render={(props) => <Home />} />
            <Route
              exact
              path="/unlock"
              render={(props) => <Unlock next="/home" />}
            />
          </Switch>
        </section>
      </HashRouter>
    );
  }
}

export default Popup;
