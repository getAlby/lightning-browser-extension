import React, { useState, useEffect } from "react";
import { HashRouter, Switch, Route } from "react-router-dom";

import Navbar from "../../components/Navbar";

import Publishers from "../../screens/Publishers";
import utils from "../../../common/lib/utils";

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
      <Navbar title={accountInfo.alias} subtitle={accountInfo.balance}>
        <Navbar.Link exact href="/">
          Publishers
        </Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
      </Navbar>

      <div className="container mx-auto px-4">
        <Switch>
          <Route exact path="/">
            <Publishers />
          </Route>
          <Route path="/send">
            <h2 className="mt-12 mb-6 text-2xl font-bold">Send</h2>
            <p>Test content</p>
          </Route>
          <Route path="/receive">
            <h2 className="mt-12 mb-6 text-2xl font-bold">Receive</h2>
            <p>Lorem ipsum</p>
          </Route>
        </Switch>
      </div>
    </HashRouter>
  );
}

export default Options;
