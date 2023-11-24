import ConnectorForm from "@components/ConnectorForm";
import Input from "@components/form/Input";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";

import galoyBitcoinJungle from "/static/assets/icons/galoy_bitcoin_jungle.png";
import galoyBlink from "/static/assets/icons/galoy_blink.png";

export const galoyUrls = {
  "galoy-blink": {
    i18nPrefix: "blink",
    label: "Blink Wallet",
    website: "https://www.blink.sv/",
    logo: galoyBlink,
    url: process.env.BLINK_GALOY_URL || "https://api.blink.sv/graphql",
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
  const [jwt, setJwt] = useState<string | undefined>();

  function handleJwtChange(event: React.ChangeEvent<HTMLInputElement>) {
    setJwt(event.target.value.trim());
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
        const errorMsg = `${t("galoy.errors.missing_token")}`;
        throw new Error(errorMsg);
      }
      const authToken = jwt;
      let headers = { ...defaultHeaders };
      if (instance === 'galoy-blink') {
        headers['X-API-KEY'] = authToken;
      } else if (instance === 'galoy-bitcoin-jungle') {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const { data: meData } = await axios.post(url, meQuery, {
          headers: headers,
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
              ? `${t("galoy.errors.invalid_token")}`
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
      submitLabel={t("galoy.actions.login")}
      submitLoading={loading}
      onSubmit={loginWithJwt}
      description={
        <Trans
          i18nKey={"galoy.token.info"}
          t={t}
          values={{ label }}
        />
      }
    >
      {
        <div className="mt-6">
          <label
            htmlFor="jwt"
            className="block font-medium text-gray-800 dark:text-white"
          >
            {t("galoy.token.label")}
          </label>
          <div className="mt-1">
            <Input
              id="jwt"
              name="jwt"
              required
              onChange={handleJwtChange}
              autoFocus={true}
            />
          </div>
        </div>
      }
    </ConnectorForm>
  );
}
