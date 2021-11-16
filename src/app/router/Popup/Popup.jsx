import React, { useState, useEffect } from "react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

import utils from "../../../common/lib/utils";

import Home from "../../screens/Home";
import Unlock from "../../screens/Unlock";
import Send from "../../screens/Send";
import Receive from "../../screens/Receive";
import LNURLPay from "../../screens/LNURLPay";

import { AuthProvider } from "../../context/AuthContext";
import RequireAuth from "../RequireAuth";
import Navbar from "../../components/Navbar";

function Popup() {
  return (
    <AuthProvider>
      <MemoryRouter>
        <section id="popup">
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <App />
                </RequireAuth>
              }
            >
              <Route index element={<Home />} />
              <Route path="send" element={<Send />} />
              <Route path="receive" element={<Receive />} />
              <Route path="lnurlPay" element={<LNURLPay />} />
            </Route>
            <Route path="unlock" element={<Unlock />} />
          </Routes>
        </section>
      </MemoryRouter>
    </AuthProvider>
  );
}

const App = () => {
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
            ? `${accountInfo.balance} sat`
            : ""
        }
        onAccountSwitch={() => {
          getAccountInfo();

          // TODO: this should be done in an eloquent way. Maybe use context?
          setKey(Date.now()); // Refresh Home.
        }}
      />

      <React.Fragment key={key}>
        <Outlet />
      </React.Fragment>
    </div>
  );
};

export default Popup;
