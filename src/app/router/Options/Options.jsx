import React, { useState, useEffect } from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import { LogoutIcon } from "@heroicons/react/outline";

import utils from "../../../common/lib/utils";
import Container from "../../components/Container";
import Navbar from "../../components/Navbar";
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

  async function lock() {
    try {
      await utils.call("lock");
      window.close();
    } catch (e) {
      console.log(e.message);
    }
  }

  return (
    <HashRouter>
      <Navbar
        title={accountInfo.alias}
        subtitle={accountInfo.balance}
        right={
          <button
            className="inline-flex items-center focus:outline-none text-gray-500 hover:text-black transition-color duration-200"
            onClick={lock}
          >
            <LogoutIcon className="h-5 w-5 mr-1" aria-hidden="true" />
            <span className="text-sm font-semibold">Log out</span>
          </button>
        }
      >
        <Navbar.Link exact href="/">
          Publishers
        </Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
      </Navbar>

      <Switch>
        <Route exact path="/">
          <Container>
            <Publishers />
          </Container>
        </Route>
        <Route exact path="/publisher/:id">
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
