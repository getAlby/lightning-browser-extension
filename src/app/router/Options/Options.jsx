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
import Settings from "../../screens/Settings";

function Options() {
  const [accountInfo, setAccountInfo] = useState({});

  useEffect(() => {
    utils.call("accountInfo").then((response) => {
      const { alias } = response.info;
      const balance = parseInt(response.balance.balance); // TODO: handle amounts
      setAccountInfo({ alias, balance });
    });
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
        right={<UserMenu />}
      >
        <Navbar.Link href="/publishers">Publishers</Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
        <Navbar.Link href="/settings">Settings</Navbar.Link>
      </Navbar>

      <Switch>
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
          <Container>
            <h2 className="mt-12 mb-6 text-2xl font-bold">Send</h2>
            <p>
              We are still working on this feature.
              <br />
              You can{" "}
              <a href="https://github.com/bumi/lightning-browser-extension/">
                join the development on GitHub
              </a>
            </p>
          </Container>
        </Route>
        <Route path="/receive">
          <Container>
            <h2 className="mt-12 mb-6 text-2xl font-bold">Receive</h2>
            <p>
              We are still working on this feature.
              <br />
              You can{" "}
              <a href="https://github.com/bumi/lightning-browser-extension/">
                join the development on GitHub
              </a>
            </p>
          </Container>
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
