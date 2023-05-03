import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import LoginFailedToast from "@components/toasts/LoginFailedToast";
import Base64 from "crypto-js/enc-base64";
import hmacSHA256 from "crypto-js/hmac-sha256";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordForm from "~/app/components/PasswordForm";
import msg from "~/common/lib/msg";

import logo from "/static/assets/icons/alby.png";

const walletCreateUrl =
  process.env.WALLET_CREATE_URL || "https://app.regtest.getalby.com/api/users";
const HMAC_VERIFY_HEADER_KEY =
  process.env.HMAC_VERIFY_HEADER_KEY || "alby-extension"; // default is mainly that TS is happy

interface LNDHubCreateResponse {
  login: string;
  password: string;
  url: string;
  lnAddress: string;
}

export type Props = {
  variant: "login" | "create";
};

const initialFormData = {
  password: "",
  passwordConfirmation: "",
  email: "",
  lnAddress: "",
};

export default function AlbyWallet({ variant }: Props) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "alby",
  });
  const { t: tCommon } = useTranslation("common");
  const [formData, setFormData] = useState(initialFormData);

  function signup(event: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();

    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Content-Type", "application/json");
    headers.append("X-User-Agent", "alby-extension");

    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      email: formData.email,
      password: formData.password,
      lightning_addresses_attributes: [{ address: formData.lnAddress }], // address must be provided as array, in theory we support multiple addresses per account
    });
    headers.append("X-TS", timestamp.toString());
    const mac = hmacSHA256(body, HMAC_VERIFY_HEADER_KEY).toString(Base64);
    headers.append("X-VERIFY", encodeURIComponent(mac));

    return fetch(walletCreateUrl, {
      method: "POST",
      headers,
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.lndhub?.login && data.lndhub?.password && data.lndhub?.url) {
          setLoading(false);
          next({
            ...data.lndhub,
            lnAddress: data.lightning_address,
          });
        } else {
          console.error(data);
          setLoading(false);
          if (data.login_failed) {
            toast.error(
              <LoginFailedToast passwordResetUrl={data.password_reset_url} />,
              { autoClose: false }
            );
          } else {
            toast.error(
              <p>
                {t("pre_connect.errors.create_wallet_error1")}
                <br />
                {t("pre_connect.errors.create_wallet_error2")}
                <br />
                {Object.keys(data).map((rule, index) => {
                  return (
                    <p key={`rule-${index}`}>
                      <span className="capitalize">{rule}</span>
                      {" - "}
                      {data[rule].join(", ")}
                      <br />
                    </p>
                  );
                })}
              </p>
            );
          }
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error(
          `${t("pre_connect.errors.create_wallet_error")} - ${e.message}`
        );
        setLoading(false);
      });
  }

  async function next(lndhub: LNDHubCreateResponse) {
    setLoading(true);

    const { login, password, url, lnAddress } = lndhub;
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
      const validation = await msg.request("validateAccount", account);
      if (validation.valid) {
        const addResult = await msg.request("addAccount", account);
        if (addResult.accountId) {
          await msg.request("selectAccount", {
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
      title={t("pre_connect.title")}
      description={t(`pre_connect.${variant}_account`)}
      logo={logo}
      submitLoading={loading}
      onSubmit={signup}
      submitDisabled={
        loading ||
        formData.password === "" ||
        formData.email === "" ||
        (variant === "create" &&
          formData.password !== formData.passwordConfirmation)
      }
    >
      <div className="mt-6">
        <TextField
          id="email"
          label={t(`pre_connect.email.${variant}.label`)}
          type="email"
          required
          autoFocus
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value.trim() });
          }}
        />
      </div>
      <div className="mt-6">
        <PasswordForm
          i18nKeyPrefix="alby.pre_connect.set_password"
          formData={formData}
          setFormData={setFormData}
          minLength={6}
          confirm={variant === "create"}
          autoFocus={false}
        />
      </div>
      {variant === "login" && (
        <p className="text-gray-700 dark:text-neutral-400">
          <a
            className="underline"
            target="_blank"
            rel="noreferrer noopener"
            href="https://getalby.com/password_resets/new"
          >
            {t("pre_connect.forgot_password")}
          </a>
        </p>
      )}
      {variant === "create" && (
        <div className="mt-6">
          <p className="mb-2 text-gray-700 dark:text-neutral-400">
            {t("pre_connect.optional_lightning_note.part1")}{" "}
            <a
              className="underline"
              href="https://lightningaddress.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              {t("pre_connect.optional_lightning_note.part2")}
            </a>
            {t("pre_connect.optional_lightning_note.part3")} (
            <a
              className="underline"
              href="https://lightningaddress.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              {t("pre_connect.optional_lightning_note.part4")}
            </a>
            )
          </p>
          <div>
            <TextField
              id="lnAddress"
              label={t("pre_connect.optional_lightning_address.label")}
              suffix={t("pre_connect.optional_lightning_address.suffix")}
              type="text"
              pattern="[a-zA-Z0-9-]{4,}"
              title={t("pre_connect.optional_lightning_address.title")}
              onChange={(e) => {
                const lnAddress = e.target.value.trim().split("@")[0]; // in case somebody enters a full address we simple remove the domain
                setFormData({ ...formData, lnAddress });
              }}
            />
          </div>
        </div>
      )}
    </ConnectorForm>
  );
}
