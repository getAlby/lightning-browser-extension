import React, { useState, useEffect } from "react";
import { HashRouter, Navigate, Routes, Route } from "react-router-dom";

import utils from "../../../common/lib/utils";
import Container from "../../components/Container";
import Navbar from "../../components/Navbar";
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
            ? `${accountInfo.balance} sat`
            : ""
        }
        onAccountSwitch={loadAccountInfo}
      >
        <Navbar.Link href="/publishers">Websites</Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
        <Navbar.Link href="/settings">Settings</Navbar.Link>
      </Navbar>

      <Routes>
        <Route path="/" element={<Navigate to="/publishers" replace />} />
        <Route path="home" element={<Navigate to="/publishers" replace />} />
        <Route path="publishers">
          <Route path=":id" element={<Publisher />} />
          <Route index element={<Publishers />} />
        </Route>
        <Route path="send" element={<Send />} />
        <Route path="receive" element={<Receive />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="accounts/new"
          element={
            <Container>
              <ChooseConnector />
            </Container>
          }
        />
        <Route
          path="test-connection"
          element={
            <Container>
              <TestConnection />
            </Container>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default Options;
