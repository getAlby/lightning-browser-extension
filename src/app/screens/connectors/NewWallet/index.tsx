import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

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
  const [passwordView, setPasswordView] = useState(false);
  const [lnAddress, setLnAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.alby",
  });
  const { t: tCommon } = useTranslation("common");

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
          toast.error(
            `${t("pre_connect.errors.create_wallet_error")} ${JSON.stringify(
              data
            )}`
          );
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error(
          `${t("pre_connect.errors.create_wallet_error")} ${e.message}`
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
        console.error({ validation });
        toast.error(
          `${tCommon("errors.connection_failed")} (${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`${tCommon("errors.connection_failed")} (${e.message})`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConnectorForm
      title={
        lndHubData.login === ""
          ? t("pre_connect.title")
          : t("post_connect.title")
      }
      submitLabel={tCommon("actions.continue")}
      submitLoading={loading}
      onSubmit={lndHubData.login ? next : signup}
      submitDisabled={password === "" || email === ""}
    >
      {lndHubData.login ? (
        <>
          <div className="mt-6 dark:text-white">
            <p>
              <strong>
                {t("post_connect.account_ready")}
                <br />
              </strong>
            </p>
            {lndHubData.lnAddress && (
              <p>
                {t("post_connect.lightning_address")} {lndHubData.lnAddress}
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-center space-x-3 items-center dark:text-white">
            <div className="flex-1">
              <strong>{t("post_connect.wallet_mobile_title")}</strong>
              <br />
              {t("post_connect.wallet_mobile_description")}
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
              {t("pre_connect.login_account")}
              <br />
              {t("pre_connect.host_wallet")}
            </strong>
          </div>

          <div className="mt-6">
            <TextField
              id="email"
              label={t("pre_connect.email_label")}
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
              label={tCommon("password")}
              type={passwordView ? "text" : "password"}
              minLength={6}
              pattern=".{6,}"
              title="at least 6 characters"
              required
              onChange={(e) => {
                setPassword(e.target.value.trim());
              }}
              endAdornment={
                <button
                  type="button"
                  className="mr-1 flex justify-center items-center w-10 h-8"
                  onClick={() => setPasswordView(!passwordView)}
                >
                  {passwordView ? (
                    <HiddenIcon className="h-6 w-6" />
                  ) : (
                    <VisibleIcon className="h-6 w-6" />
                  )}
                </button>
              }
            />
          </div>
          <div className="mt-6">
            <p className="mb-2 text-gray-700 dark:text-neutral-400">
              Your Alby account also comes with an optional{" "}
              <a
                className="underline"
                href="https://lightningaddress.com/"
                target="_blank"
                rel="noreferrer"
              >
                {t("pre_connect.optional_lightning_note.part2")}
              </a>
              {t("pre_connect.optional_lightning_note.part3")} (
              <a
                className="underline"
                href="https://lightningaddress.com/"
                target="_blank"
                rel="noreferrer"
              >
                {t("pre_connect.optional_lightning_note.part4")}
              </a>
              )
            </p>
            <div>
              <TextField
                id="lnAddress"
                label={t("pre_connect.optional_lightning_address_label")}
                suffix={t("pre_connect.optional_lightning_address_suffix")}
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
