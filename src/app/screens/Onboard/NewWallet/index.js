import React, { useState } from "react";
import Input from "../../../components/Form/input";
import Button from "../../../components/button";
import { useHistory } from "react-router-dom";
import QRCode from "react-qr-code";

import utils from "../../../../common/lib/utils";

const url = "https://lndhub.herokuapp.com";

export default function NewWallet() {
  const [lndHubData, setLndHubData] = useState({
    login: "",
    password: "",
  });
  const history = useHistory();

  function handleNext(event) {
    event.preventDefault();
    if (lndHubData.login && lndHubData.password) {
      return next();
    } else {
      return signup();
    }
  }

  function signup() {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Content-Type", "application/json");

    return fetch(`${url}/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ partnerid: "bluewallet", accounttype: "common" }),
    }).then((res) => {
      res.json().then((data) => {
        setLndHubData(data);
      });
    });
  }

  async function next() {
    const { login, password } = lndHubData;
    const account = {
      name: "LNDHub",
      config: {
        login,
        password,
        url,
      },
      connector: "lndhub",
    };

    try {
      const validation = await utils.call("validateAccount", account);
      if (validation.valid) {
        const addResult = await utils.call("addAccount", account);
        if (addResult.accountId) {
          const selectResult = await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          history.push("/test-connection");
        }
      } else {
        console.log(validation);
        alert(`Connection failed (${validation.error})`);
      }
    } catch (e) {
      console.log(e);
      alert(`Connection failed (${e.message})`);
    }
  }

  return (
    <div>
      <div className="relative lg:flex mt-24">
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold">Get a new lightning wallet</h1>
          <p className="text-gray-500 mt-6"></p>
          {!lndHubData.login && (
            <div className="w-4/5">
              <div className="mt-6">
                <strong>Remember, not your keys, not your coins.</strong>
                This quick setup uses a custodial service to manage your wallet.
              </div>
            </div>
          )}
          {lndHubData.login && (
            <div className="w-4/5">
              <div className="mt-6">
                <Input
                  name="uri"
                  type="text"
                  value={`lndhub://${lndHubData.login}:${lndHubData.password}@${url}/`}
                  disabled
                />
              </div>
              <div className="mt-6">
                <p>
                  <strong>
                    We have created a new wallet for you. <br />
                    Please save this backup!
                  </strong>
                </p>
                <div className="float-right m-1">
                  <QRCode
                    value={`lndhub://${lndHubData.login}:${lndHubData.password}@${url}/`}
                    level="M"
                    size="72"
                  />
                </div>
                If you loose access you will need this backup to recover your
                wallet. You can also import the wallet into your BlueWallet
                mobile app using the QR Code.
              </div>
            </div>
          )}
          <div className="mt-8 flex space-x-4">
            <Button
              label="Back"
              onClick={(e) => {
                e.preventDefault();
                history.goBack();
                return false;
              }}
            />
            <Button
              label={lndHubData.login ? "Next" : "Create a wallet"}
              onClick={handleNext}
              primary
            />
          </div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <div className="lg:flex h-full justify-center items-center">
            <img
              src="assets/icons/satsymbol.svg"
              alt="Sats"
              className="max-w-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
