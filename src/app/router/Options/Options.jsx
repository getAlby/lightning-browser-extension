import React, { useState, useEffect } from "react";
import { HashRouter, Switch, Redirect, Route } from "react-router-dom";

import utils from "../../../common/lib/utils";
import Container from "../../components/Container";
import Navbar from "../../components/Navbar";
import UserMenu from "../../components/UserMenu";
import Publishers from "../../screens/Publishers";
import Publisher from "../../screens/Publisher";

function Options() {
  const [accountInfo, setAccountInfo] = useState({});

  useEffect(() => {
    utils.call("accountInfo").then((response) => {
      const { alias } = response.info;
      const { balance } = response.balance;

      setAccountInfo({ alias, balance });
    });
  }, []);

  return (
    <HashRouter>
      <Navbar
        title={accountInfo.alias}
        subtitle={accountInfo.balance}
        right={<UserMenu />}
      >
        <Navbar.Link href="/publishers">Publishers</Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
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
            <p>Test content</p>
          </Container>
        </Route>
        <Route path="/receive">
          <Container>
            <h2 className="mt-12 mb-6 text-2xl font-bold">Receive</h2>
            <p>Lorem ipsum</p>
          </Container>
        </Route>
      </Switch>
    </HashRouter>
  );
}

export default Options;
