import ConnectorForm from "@components/ConnectorForm";
import Input from "@components/form/Input";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import msg from "~/common/lib/msg";

import galoyBitcoinBeach from "/static/assets/icons/galoy_bitcoin_beach.png";
import galoyBitcoinJungle from "/static/assets/icons/galoy_bitcoin_jungle.png";

export const galoyUrls = {
  "galoy-bitcoin-beach": {
    i18nPrefix: "bitcoin_beach",
    label: "Bitcoin Beach Wallet",
    website: "https://galoy.io/bitcoin-beach-wallet/",
    logo: galoyBitcoinBeach,
    url:
      process.env.BITCOIN_BEACH_GALOY_URL ||
      "https://api.mainnet.galoy.io/graphql/",
  },
  "galoy-bitcoin-jungle": {
    i18nPrefix: "bitcoin_jungle",
    label: "Bitcoin Jungle Wallet",
    website: "https://bitcoinjungle.app/",
    logo: galoyBitcoinJungle,
    url:
      process.env.BITCOIN_JUNGLE_GALOY_URL ||
      "https://api.mainnet.bitcoinjungle.app/graphql",
  },
} as const;

const defaultHeaders = {
  Accept: "application/json",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

type Props = {
  instance: keyof typeof galoyUrls;
};

export default function ConnectGaloy(props: Props) {
  const { instance } = props;
  const { url, label, website, i18nPrefix, logo } = galoyUrls[instance];

  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector",
  });
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [smsCode, setSmsCode] = useState<string | undefined>();
  const [smsCodeRequested, setSmsCodeRequested] = useState<
    boolean | undefined
  >();
  const [jwt, setJwt] = useState<string | undefined>();
  const [acceptJwtDirectly, setAcceptJwtDirectly] = useState<
    boolean | undefined
  >();

  function handlePhoneNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPhoneNumber(event.target.value.trim());
  }

  function handleSmsCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSmsCode(event.target.value.trim());
  }

  function handleJwtChange(event: React.ChangeEvent<HTMLInputElement>) {
    setJwt(event.target.value.trim());
  }

  async function requestSmsCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const query = {
      query: `
        mutation userRequestAuthCode($input: UserRequestAuthCodeInput!) {
          userRequestAuthCode(input: $input) {
            errors {
              message
            }
            success
          }
        }
      `,
      variables: {
        input: {
          phone: phoneNumber,
        },
      },
    };

    try {
      const {
        data: { data, errors },
      } = await axios.post(url, query, {
        headers: defaultHeaders,
        adapter: fetchAdapter,
      });
      const errs = errors || data.userRequestAuthCode.errors;
      if (errs && errs.length) {
        console.error(errs);
        const errMessage = errs[0].message;

        const captchaRegex = /use captcha/;
        if (errMessage.match(captchaRegex)) {
          setAcceptJwtDirectly(true);
        } else {
          const alertMsg = `${t("galoy.errors.failed_to_request_sms")}${
            errMessage ? `: ${errMessage}` : ""
          }`;
          toast.error(alertMsg);
        }
      } else {
        setSmsCodeRequested(data.userRequestAuthCode.success);
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`${t("galoy.errors.failed_to_request_sms")}: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function requestAuthToken(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const authQuery = {
      query: `
        mutation userLogin($input: UserLoginInput!) {
          userLogin(input: $input) {
            errors {
                message
            }
            authToken
          }
        }
      `,
      variables: {
        input: {
          phone: phoneNumber,
          code: smsCode,
        },
      },
    };
    const meQuery = {
      query: `
          query getinfo {
            me {
              defaultAccount {
                defaultWalletId
              }
            }
          }
        `,
    };
    try {
      const { data: authData } = await axios.post(url, authQuery, {
        headers: defaultHeaders,
        adapter: fetchAdapter,
      });
      if (authData.error || authData.errors) {
        const error = authData.error || authData.errors;
        const errMessage = error?.errors?.[0]?.message || error?.[0]?.message;
        const errorMsg = `${t("galoy.errors.failed_to_login_sms")}${
          errMessage ? `: ${errMessage}` : ""
        }`;
        throw new Error(errorMsg);
      }
      if (authData.data.userLogin.errors.length > 0) {
        throw new Error(authData.data.userLogin.errors[0].message);
      }
      const authToken = authData.data.userLogin.authToken as string;

      const { data: meData } = await axios.post(url, meQuery, {
        headers: {
          ...defaultHeaders,
          Authorization: `Bearer ${authToken}`,
        },
        adapter: fetchAdapter,
      });
      if (meData.error || meData.errors) {
        const error = meData.error || meData.errors;
        console.error(error);
        const errMessage = error?.errors?.[0]?.message || error?.[0]?.message;
        const alertMsg = `${t("galoy.errors.setup_failed")}${
          errMessage ? `: ${errMessage}` : ""
        }`;
        toast.error(alertMsg);
      } else {
        const walletId = meData.data.me.defaultAccount.defaultWalletId;
        saveAccount({ authToken, walletId });
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`${t("galoy.errors.setup_failed")}: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loginWithJwt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const meQuery = {
      query: `
          query getinfo {
            me {
              defaultAccount {
                defaultWalletId
              }
            }
          }
        `,
    };
    try {
      if (!jwt) {
        const errorMsg = `${t("galoy.errors.missing_jwt")}`;
        throw new Error(errorMsg);
      }
      const authToken = jwt;

      const { data: meData } = await axios.post(url, meQuery, {
        headers: {
          ...defaultHeaders,
          Authorization: `Bearer ${authToken}`,
        },
        adapter: fetchAdapter,
      });
      if (meData.error || meData.errors) {
        const error = meData.error || meData.errors;
        console.error(error);
        const errMessage = error?.errors?.[0]?.message || error?.[0]?.message;
        const alertMsg = `${t("galoy.errors.setup_failed")}${
          errMessage ? `: ${errMessage}` : ""
        }`;
        toast.error(alertMsg);
      } else {
        const walletId = meData.data.me.defaultAccount.defaultWalletId;
        saveAccount({ authToken, walletId });
      }
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        const unauthedRegex = /status code 401/;
        toast.error(
          `${t("galoy.errors.setup_failed")}: ${
            e.message.match(unauthedRegex)
              ? `${t("galoy.errors.invalid_jwt")}`
              : e.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveAccount(config: { authToken: string; walletId: string }) {
    setLoading(true);

    const account = {
      name: label,
      config: {
        url,
        accessToken: config.authToken,
        walletId: config.walletId,
      },
      connector: "galoy",
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
        toast.error(
          <ConnectionErrorToast message={validation.error as string} />
        );
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(<ConnectionErrorToast message={e.message} />);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConnectorForm
      title={
        <h1 className="text-2xl font-bold dark:text-white">
          <Trans
            i18nKey={`${i18nPrefix}.page.title`}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <a className="underline" href={website}></a>,
            ]}
          />
        </h1>
      }
      logo={logo}
      submitLabel={
        smsCodeRequested || smsCode || acceptJwtDirectly || jwt
          ? t("galoy.actions.login")
          : t("galoy.actions.request_sms_code")
      }
      submitLoading={loading}
      submitDisabled={!phoneNumber}
      onSubmit={
        smsCodeRequested || smsCode
          ? requestAuthToken
          : acceptJwtDirectly || jwt
          ? loginWithJwt
          : requestSmsCode
      }
    >
      {!acceptJwtDirectly && (
        <div>
          <label
            htmlFor="phone"
            className="block font-medium text-gray-700 dark:text-white"
          >
            {t("galoy.phone_number.label")}
          </label>
          <div className="mt-1">
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="+503"
              disabled={smsCodeRequested}
              onChange={handlePhoneNumberChange}
              autoFocus={true}
            />
          </div>
        </div>
      )}
      {smsCodeRequested && (
        <div className="mt-6">
          <label htmlFor="2fa" className="block font-medium text-gray-700">
            {t("galoy.sms_code.label")}
          </label>
          <div className="mt-1">
            <Input
              id="2fa"
              name="2fa"
              type="text"
              required
              onChange={handleSmsCodeChange}
            />
          </div>
        </div>
      )}
      {acceptJwtDirectly && (
        <div className="mt-6">
          <Trans
            i18nKey={"galoy.jwt.info"}
            t={t}
            values={{ label }}
            components={[
              // eslint-disable-next-line react/jsx-key
              <a
                href="https://wallet.mainnet.galoy.io"
                className="underline"
              ></a>,
              // eslint-disable-next-line react/jsx-key
              <br />,
              // eslint-disable-next-line react/jsx-key
              <b></b>,
            ]}
          />
          <label htmlFor="jwt" className="block font-medium text-gray-700">
            {t("galoy.jwt.label")}
          </label>
          <div className="mt-1">
            <Input
              id="jwt"
              name="jwt"
              type="text"
              required
              onChange={handleJwtChange}
              autoFocus={true}
            />
          </div>
        </div>
      )}
    </ConnectorForm>
  );
}
