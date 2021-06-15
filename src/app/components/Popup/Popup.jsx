import React from "react";
import { createHashHistory } from "history";
import { HashRouter, Switch, Route } from "react-router-dom";

import utils from "../../../common/lib/utils";
import Home from "../../screens/Home";
import Unlock from "../Unlock";
import Loading from "../Loading";

import "./styles.scss";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
  }

  componentDidMount() {
    utils
      .call("isUnlocked")
      .then((response) => {
        if (response.unlocked) {
          this.history.replace("/home");
        } else {
          this.history.replace("/unlock");
        }
      })
      .catch((e) => {
        console.log(e);
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
