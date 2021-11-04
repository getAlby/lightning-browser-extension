import React, { useState, useEffect } from "react";
import { HashRouter, Switch, Redirect, Route } from "react-router-dom";

import utils from "../../../common/lib/utils";
import Container from "../../components/Container";
import Navbar from "../../components/Navbar";
import UserMenu from "../../components/UserMenu";
import Publishers from "../../screens/Publishers";
import Publisher from "../../screens/Publisher";
import ChooseConnector from "../../screens/Options/ChooseConnector";
import TestConnection from "../../screens/Options/TestConnection";
import Send from "../../screens/Send";
import Receive from "../../screens/Receive";
import Settings from "../../screens/Settings";

function Options() {
  const [accountInfo, setAccountInfo] = useState({});

  function loadAccountInfo() {
    return utils.call("accountInfo").then((response) => {
      const { alias } = response.info;
      const balance = parseInt(response.balance.balance); // TODO: handle amounts
      setAccountInfo({ alias, balance });
    });
  }

  useEffect(() => {
    utils
      .call("status")
      .then((response) => {
        if (!response.configured) {
          utils.openPage("welcome.html");
          window.close();
        }
      })
      .catch((e) => {
        console.log(e);
      });
    loadAccountInfo();
  }, []);

  return (
    <HashRouter>
      <Navbar
        title={accountInfo.alias}
        subtitle={
          typeof accountInfo.balance === "number"
            ? `${accountInfo.balance} Sats`
            : ""
        }
        onAccountSwitch={loadAccountInfo}
      >
        <Navbar.Link href="/publishers">Websites</Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
        <Navbar.Link href="/settings">Settings</Navbar.Link>
      </Navbar>

      <Switch>
        <Redirect from="/home" to="/publishers" />
        <Route exact path="/">
          <Redirect to="/publishers" />
        </Route>
        <Route exact path="/publishers">
          <Publishers />
        </Route>
        <Route path="/publishers/:id">
          <Publisher />
        </Route>
        <Route path="/send">
          <Send />
        </Route>
        <Route path="/receive">
          <Receive />
        </Route>
        <Route path="/settings">
          <Settings />
        </Route>
        <Route path="/accounts/new">
          <Container>
            <ChooseConnector />
          </Container>
        </Route>
        <Route path="/test-connection">
          <Container>
            <TestConnection />
          </Container>
        </Route>
      </Switch>
    </HashRouter>
  );
}

export default Options;
