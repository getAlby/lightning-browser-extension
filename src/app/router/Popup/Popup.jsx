import React, { useState, useEffect } from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

import utils from "../../../common/lib/utils";

import Home from "../../screens/Home";
import Unlock from "../../screens/Unlock";
import Send from "../../screens/Send";
import Receive from "../../screens/Receive";
import LNURLPay from "../../screens/LNURLPay";

import Loading from "../../components/Loading";
import Navbar from "../../components/Navbar";

function GateKeeping() {
  const navigate = useNavigate();

  useEffect(() => {
    utils
      .call("status")
      .then((response) => {
        if (!response.configured) {
          utils.openPage("welcome.html");
          window.close();
        } else if (response.unlocked) {
          navigate("/home", { replace: true });
        } else {
          navigate("/unlock", { replace: true });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return <Loading />;
}

function Popup() {
  return (
    <MemoryRouter>
      <section id="popup">
        <Routes>
          <Route path="/" element={<GateKeeping />} />
          <Route path="unlock" element={<Unlock next="/home" />} />

          {/* TODO: these routes should not be accessible when locked. See: https://reactrouter.com/docs/en/v6/examples/auth */}
          <Route path="*" element={<Default />} />
        </Routes>
      </section>
    </MemoryRouter>
  );
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
            ? `${accountInfo.balance} sat`
            : ""
        }
        onAccountSwitch={() => {
          getAccountInfo();
          setKey(Date.now()); // Refresh Home.
        }}
      />
      <Routes>
        <Route path="home" element={<Home key={key} />} />
        <Route path="send" element={<Send />} />
        <Route path="receive" element={<Receive />} />
        <Route path="lnurlPay" element={<LNURLPay />} />
      </Routes>
    </div>
  );
};

export default Popup;
