import React from "react";
import browser from "webextension-polyfill";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import { createHashHistory } from "history";
import utils from "../lib/utils";

import Unlock from "../components/unlock";
import Home from "../components/home";
import Loading from "../components/loading";

import "./styles.scss";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
  }

  componentDidMount() {
    utils.call("isUnlocked").then((unlocked) => {
      if (unlocked) {
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
            <Route exact path="/unlock" render={(props) => <Unlock />} />
          </Switch>
        </section>
      </HashRouter>
    );
  }
}

export default Popup;
