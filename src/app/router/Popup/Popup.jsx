import React, { useState, useEffect } from "react";
import { createHashHistory } from "history";
import { HashRouter, Switch, Route } from "react-router-dom";

import utils from "../../../common/lib/utils";
import Home from "../../screens/Home";
import Unlock from "../../screens/Unlock";
import Loading from "../../components/Loading";
import Navbar from "../../components/Navbar";
import UserMenu from "../../components/UserMenu";

import "./styles.scss";

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
  }

  componentDidMount() {
    utils
      .call("status")
      .then((response) => {
        if (!response.configured) {
          utils.openPage("welcome.html");
          window.close();
        } else if (response.unlocked) {
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
            <Route
              exact
              path="/unlock"
              render={(props) => <Unlock next="/" />}
            />
            <Route component={Default} />
          </Switch>
        </section>
      </HashRouter>
    );
  }
}

const Default = () => {
  const [accountInfo, setAccountInfo] = useState({});
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    getAccountInfo();
  }, []);

  function getAccountInfo() {
    utils.call("accountInfo").then((response) => {
      const { alias } = response.info;
      const balance = parseInt(response.balance.balance); // TODO: handle amounts
      setAccountInfo({ alias, balance });
    });
  }

  return (
    <div>
      <Navbar
        title={accountInfo.alias}
        subtitle={
          typeof accountInfo.balance === "number"
            ? `${accountInfo.balance} Sats`
            : ""
        }
        right={
          <UserMenu
            onAccountSwitch={() => {
              getAccountInfo();
              setKey(Date.now()); // Refresh Home.
            }}
          />
        }
      />
      <Route path="/home" render={(props) => <Home key={key} />} />
    </div>
  );
};

export default Popup;
