import React, { useState } from "react";
import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useHistory } from "react-router-dom";
import QRCode from "react-qr-code";

import utils from "../../../../common/lib/utils";

const url = process.env.ALBY_LNDHUB_URL || "https://lndhub.getalby.com";

export default function NewWallet() {
  const [lndHubData, setLndHubData] = useState({
    login: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  function signup(event: React.MouseEvent<HTMLButtonElement>) {
    setLoading(true);
    event.preventDefault();

    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Content-Type", "application/json");

    return fetch(`${url}/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ partnerid: "bluewallet", accounttype: "common" }),
    })
      .then((res) => {
        res.json().then((data) => {
          if (data.login && data.password) {
            setLndHubData(data);
          } else {
            console.error(data);
            alert("Failed to create a new wallet. Please contact support.");
          }
        });
      })
      .catch((e) => {
        console.error(e);
        alert(`Failed to create a new wallet: ${e.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function next(event: React.MouseEvent<HTMLButtonElement>) {
    setLoading(true);
    event.preventDefault();

    const { login, password } = lndHubData;
    const account = {
      name: "Alby",
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
          await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          history.push("/test-connection");
        }
      } else {
        console.log({ validation });
        alert(`Connection failed (${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        alert(`Connection failed (${e.message})`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="relative lg:flex mt-24">
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold">Get a new lightning wallet</h1>
          <p className="text-gray-500 mt-6"></p>
          {lndHubData.login ? (
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
                    size={96}
                  />
                </div>
                If you loose access you will need this backup to recover your
                wallet. You can also import the wallet into your BlueWallet
                mobile app using the QR Code.
              </div>
            </div>
          ) : (
            <div className="w-4/5">
              <div className="mt-6">
                <strong>Remember, not your keys, not your coins.</strong>
                This quick setup uses a custodial service to manage your wallet.
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
              loading={loading}
              onClick={lndHubData.login ? next : signup}
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
