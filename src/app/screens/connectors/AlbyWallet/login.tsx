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

const walletRootUrl =
  process.env.WALLET_ROOT_URL || "https://app.regtest.getalby.com";
const walletLoginUrl = `${walletRootUrl}/extension/users/login`;
const HMAC_VERIFY_HEADER_KEY =
  process.env.HMAC_VERIFY_HEADER_KEY || "alby-extension"; // default is mainly that TS is happy
const VERSION = process.env.VERSION || "unknown"; // default is mainly that TS is happy

interface LNDHubCreateResponse {
  login: string;
  password: string;
  url: string;
  lnAddress: string;
}

const initialFormData = {
  password: "",
  passwordConfirmation: "",
  email: "",
};

type Props = {
  options: Record<string, unknown>;
};

export default function AlbyWalletLogin({ options }: Props) {
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
    headers.append("Content-Type", "application/json");
    headers.append("X-User-Agent", "alby-extension");
    headers.append("X-Alby-Version", VERSION);
    headers.append("X-Session-Key", options.session_key as string);

    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      email: formData.email,
      password: formData.password,
    });
    headers.append("X-TS", timestamp.toString());
    const macBody = hmacSHA256(body, HMAC_VERIFY_HEADER_KEY).toString(Base64);
    const macUrl = hmacSHA256(walletLoginUrl, HMAC_VERIFY_HEADER_KEY).toString(
      Base64
    );
    headers.append("X-VERIFY", encodeURIComponent(macBody));
    headers.append("X-VERIFY-URL", encodeURIComponent(macUrl));

    return fetch(walletLoginUrl, {
      method: "PUT",
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
      description={t(`pre_connect.login_account`)}
      logo={logo}
      submitLoading={loading}
      onSubmit={signup}
      submitDisabled={
        loading || formData.password === "" || formData.email === ""
      }
    >
      <div className="mt-6">
        <TextField
          id="email"
          label={t(`pre_connect.email.login.label`)}
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
          confirm={false}
          autoFocus={false}
        />
      </div>
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
    </ConnectorForm>
  );
}
