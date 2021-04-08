import React from "react";
import qs from "query-string";
import { createHashHistory } from "history";
import { HashRouter, Route, Switch } from "react-router-dom";

import utils from "../../../common/lib/utils";
import Unlock from "../Unlock";
import Enable from "../Enable";
import Loading from "../Loading";
import ConfirmPayment from "../ConfirmPayment";

import "./styles.scss";

class Prompt extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    const message = qs.parse(window.location.search);
    let origin = {};
    let args = {};
    if (message.origin) {
      origin = JSON.parse(message.origin);
    }
    if (message.args) {
      args = JSON.parse(message.args);
    }
    this.state = { origin, args, type: message.type };
  }

  componentDidMount() {
    utils.call("isUnlocked").then((response) => {
      if (response.unlocked) {
        this.history.replace(`${this.state.type}`);
      } else {
        this.history.replace("/unlock");
      }
    });
  }

  render() {
    return (
      <HashRouter>
        <section id="prompt">
          <Switch>
            <Route exact path="/" render={(props) => <Loading />} />
            <Route
              exact
              path="/unlock"
              render={(props) => <Unlock next={`/${this.state.type}`} />}
            />
            <Route
              exact
              path="/enable"
              render={(props) => <Enable origin={this.state.origin} />}
            />
            <Route
              exact
              path="/sendPayment"
              render={(props) => <ConfirmPayment origin={this.state.origin} />}
            />
          </Switch>
        </section>
      </HashRouter>
    );
  }
}

export default Prompt;
