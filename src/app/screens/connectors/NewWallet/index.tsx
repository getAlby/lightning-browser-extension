import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";

import utils from "~/common/lib/utils";

import TextField from "@components/form/TextField";
import ConnectorForm from "@components/ConnectorForm";

const walletCreateUrl =
  process.env.WALLET_CREATE_URL || "https://app.regtest.getalby.com/api/users";

export default function NewWallet() {
  const [lndHubData, setLndHubData] = useState({
    login: "",
    password: "",
    url: "",
    lnAddress: "",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lnAddress, setLnAddress] = useState("");
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
      body: JSON.stringify({
        email,
        password,
        lightning_addresses_attributes: [{ address: lnAddress }], // address must be provided as array, in theory we support multiple addresses per account
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.lndhub?.login && data.lndhub?.password && data.lndhub?.url) {
          setLndHubData({
            ...data.lndhub,
            lnAddress: data.lightning_address,
          });
        } else {
          console.error(data);
          toast.error(`Failed to create a new wallet. ${JSON.stringify(data)}`);
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error(`Failed to create a new wallet: ${e.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function next(event: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();

    const { login, password, url, lnAddress } = lndHubData;
    const name = lnAddress || "Alby"; // use the ln address as name or Alby to default
    const account = {
      name,
      config: {
        login,
        password,
        url,
        lnAddress,
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
        toast.error(`Connection failed (${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Connection failed (${e.message})`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConnectorForm
      title={
        lndHubData.login === "" ? "Your Alby Lightning Wallet" : "🎉Success!"
      }
      submitLabel="Continue"
      submitLoading={loading}
      onSubmit={lndHubData.login ? next : signup}
      submitDisabled={password === "" || email === ""}
    >
      {lndHubData.login ? (
        <>
          <div className="mt-6 dark:text-white">
            <p>
              <strong>
                Your Alby account is ready. <br />
              </strong>
            </p>
            {lndHubData.lnAddress && (
              <p>Your lightning address: {lndHubData.lnAddress}</p>
            )}
          </div>
          <div className="mt-6 flex justify-center space-x-3 items-center dark:text-white">
            <div className="flex-1">
              <strong>Want to use your wallet on your mobile?</strong>
              <br />
              Import the wallet into Zeus or BlueWallet mobile app using the QR
              Code.
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
            <strong>
              Create or login to your Alby account.
              <br />
              We host a Lightning wallet for you!
            </strong>
          </div>

          <div className="mt-6">
            <TextField
              id="email"
              label="Email Address"
              type="email"
              required
              onChange={(e) => {
                setEmail(e.target.value.trim());
              }}
            />
          </div>
          <div className="mt-6">
            <TextField
              id="password"
              label="Password"
              type="password"
              minLength={6}
              pattern=".{6,}"
              title="at least 6 characters"
              required
              onChange={(e) => {
                setPassword(e.target.value.trim());
              }}
            />
          </div>
          <div className="mt-6">
            <p className="mb-2 text-gray-700 dark:text-gray-400">
              Your Alby account also comes with an optional{" "}
              <a
                className="underline"
                href="https://lightningaddress.com/"
                target="_blank"
                rel="noreferrer"
              >
                Lightning Address
              </a>
              . This is a simple way for anyone to send you Bitcoin on the
              Lightning Network. (
              <a
                className="underline"
                href="https://lightningaddress.com/"
                target="_blank"
                rel="noreferrer"
              >
                learn more
              </a>
              )
            </p>
            <div>
              <TextField
                id="lnAddress"
                label="Choose your Lightning Address (optional)"
                suffix="@getalby.com"
                type="text"
                onChange={(e) => {
                  setLnAddress(e.target.value.trim().split("@")[0]); // in case somebody enters a full address we simple remove the domain
                }}
              />
            </div>
          </div>
        </>
      )}
    </ConnectorForm>
  );
}
