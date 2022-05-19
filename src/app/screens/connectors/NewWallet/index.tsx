import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";

import utils from "~/common/lib/utils";

import TextField from "@components/form/TextField";
import ConnectorForm from "@components/ConnectorForm";

const walletCreateUrl =
  process.env.WALLET_CREATE_URL || "https://getalby.com/api/users";

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
  const { t } = useTranslation();

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
          alert(
            `${t(
              "choose_connector.alby.pre_connect.errors.create_wallet_error"
            )}. ${JSON.stringify(data)}`
          );
        }
      })
      .catch((e) => {
        console.error(e);
        alert(
          `${t(
            "choose_connector.alby.pre_connect.errors.create_wallet_error"
          )}: ${e.message}`
        );
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
        alert(
          `${t(
            "choose_connector.alby.pre_connect.errors.connection_failed_error"
          )} (${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        alert(
          `${t(
            "choose_connector.alby.pre_connect.errors.connection_failed_error"
          )} (${e.message})`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConnectorForm
      title={
        lndHubData.login === ""
          ? t("choose_connector.alby.pre_connect.title")
          : t("choose_connector.alby.post_connect.title")
      }
      submitLabel={t("choose_connector.alby.actions.continue")}
      submitLoading={loading}
      onSubmit={lndHubData.login ? next : signup}
      submitDisabled={password === "" || email === ""}
    >
      {lndHubData.login ? (
        <>
          <div className="mt-6 dark:text-white">
            <p>
              <strong>
                <br />
              </strong>
            </p>
            {lndHubData.lnAddress && (
              <p>
                {t("choose_connector.alby.post_connect.lightning_address")}{" "}
                {lndHubData.lnAddress}
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-center space-x-3 items-center dark:text-white">
            <div className="flex-1">
              <strong>
                {t("choose_connector.alby.post_connect.wallet_mobile_title")}
              </strong>
              <br />
              {t(
                "choose_connector.alby.post_connect.wallet_mobile_description"
              )}
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
              {t("choose_connector.alby.pre_connect.login_account")}
              <br />
              {t("choose_connector.alby.pre_connect.host_wallet")}
            </strong>
          </div>

          <div className="mt-6">
            <TextField
              id="email"
              label={t("choose_connector.alby.pre_connect.email_label")}
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
              label={t("choose_connector.alby.pre_connect.password_label")}
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
              {t(
                "choose_connector.alby.pre_connect.optional_lightning_note.part1"
              )}{" "}
              <a
                className="underline"
                href="https://lightningaddress.com/"
                target="_blank"
                rel="noreferrer"
              >
                {t(
                  "choose_connector.alby.pre_connect.optional_lightning_note.part2"
                )}
              </a>
              {t(
                "choose_connector.alby.pre_connect.optional_lightning_note.part3"
              )}{" "}
              (
              <a
                className="underline"
                href="https://lightningaddress.com/"
                target="_blank"
                rel="noreferrer"
              >
                {t(
                  "choose_connector.alby.pre_connect.optional_lightning_note.part4"
                )}
              </a>
              )
            </p>
            <div>
              <TextField
                id="lnAddress"
                label={t(
                  "choose_connector.alby.pre_connect.optional_lightning_address_label"
                )}
                suffix={t(
                  "choose_connector.alby.pre_connect.optional_lightning_address_suffix"
                )}
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
