import { useState, useEffect } from "react";
import { HashRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";

import utils from "../../../common/lib/utils";
import { AuthProvider } from "../../context/AuthContext";
import RequireAuth from "../RequireAuth";
import Container from "../../components/Container";
import Navbar from "../../components/Navbar";
import Publishers from "../../screens/Publishers";
import Publisher from "../../screens/Publisher";
import ChooseConnector from "../../screens/Options/ChooseConnector";
import TestConnection from "../../screens/Options/TestConnection";
import Send from "../../screens/Send";
import Receive from "../../screens/Receive";
import Settings from "../../screens/Settings";
import Unlock from "../../screens/Unlock";
import Websites from "../../screens/websites";

function Options() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/websites" replace />} />
            <Route path="websites">
              <Route path=":id" element={<Publisher />} />
              <Route index element={<Websites />} />
            </Route>
            <Route path="send" element={<Send />} />
            <Route path="receive" element={<Receive />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="accounts/new/*"
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
          </Route>
          <Route path="unlock" element={<Unlock />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

const Layout = () => {
  const [accountInfo, setAccountInfo] = useState({});

  useEffect(() => {
    getAccountInfo();
  }, []);

  function getAccountInfo() {
    setAccountInfo({});
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
            ? `${accountInfo.balance} sat`
            : ""
        }
        onAccountSwitch={getAccountInfo}
      >
        <Navbar.Link href="/websites">Websites</Navbar.Link>
        <Navbar.Link href="/send">Send</Navbar.Link>
        <Navbar.Link href="/receive">Receive</Navbar.Link>
        <Navbar.Link href="/settings">Settings</Navbar.Link>
      </Navbar>

      <Outlet />
    </div>
  );
};

export default Options;
