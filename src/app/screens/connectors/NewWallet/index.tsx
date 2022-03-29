import { useState } from "react";
import Input from "../../../components/form/Input";
import TextField from "../../../components/form/TextField";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

import utils from "../../../../common/lib/utils";

import ConnectorForm from "../../../components/ConnectorForm";

const walletCreateUrl =
  process.env.WALLET_CREATE_URL || "https://getalby.com/api/users";

export default function NewWallet() {
  const [lndHubData, setLndHubData] = useState({
    login: "",
    password: "",
    url: "",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function signup(event: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();

    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Content-Type", "application/json");

    return fetch(walletCreateUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    })
      .then((res) => {
        res.json().then((data) => {
          if (data.lndhub?.login && data.lndhub?.password && data.lndhub?.url) {
            setLndHubData(data.lndhub);
          } else {
            console.error(data);
            alert(
              "Failed to create a new wallet. Please try again and contact support."
            );
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

  async function next(event: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();

    const { login, password, url } = lndHubData;
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
          navigate("/test-connection");
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
    <ConnectorForm
      title="Get a new lightning wallet"
      submitLabel={lndHubData.login ? "Continue" : "Create a wallet"}
      submitLoading={loading}
      onSubmit={lndHubData.login ? next : signup}
    >
      {lndHubData.login ? (
        <>
          <div className="mt-6">
            <Input
              name="uri"
              type="text"
              value={`lndhub://${lndHubData.login}:${lndHubData.password}@${lndHubData.url}/`}
              disabled
            />
          </div>
          <div className="mt-6 flex justify-center space-x-3 items-center dark:text-white">
            <div className="flex-1">
              <p className="my-2">
                <strong>
                  We have created a new wallet for you. <br />
                  Please save this backup!
                </strong>
              </p>
              If you loose access you will need this backup to recover your
              wallet. You can also import the wallet into your BlueWallet mobile
              app using the QR Code.
            </div>
            <div className="float-right">
              <QRCode
                value={`lndhub://${lndHubData.login}:${lndHubData.password}@${lndHubData.url}/`}
                level="M"
                size={130}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mt-6 dark:text-white">
            <strong>We host a lightning wallet for you!</strong>
            <br />
            ...but remember: not your keys, not your coins.
          </div>

          <div className="mt-6">
            <TextField
              id="email"
              label="Email Address"
              type="email"
              onChange={(e) => {
                setEmail(e.target.value.trim());
              }}
            />
          </div>
        </>
      )}
    </ConnectorForm>
  );
}
