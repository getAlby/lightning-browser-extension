import ConnectorForm from "@components/ConnectorForm";
import Input from "@components/form/Input";
import Select from "@components/form/Select";
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
    getHeaders: (authToken: string) => ({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": authToken,
    }),
    apiCompatibilityMode: false,
  },
  "galoy-bitcoin-jungle": {
    i18nPrefix: "bitcoin_jungle",
    label: "Bitcoin Jungle Wallet",
    website: "https://bitcoinjungle.app/",
    logo: galoyBitcoinJungle,
    url:
      process.env.BITCOIN_JUNGLE_GALOY_URL ||
      "https://api.mainnet.bitcoinjungle.app/graphql",
    getHeaders: (authToken: string) => ({
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    }),
    apiCompatibilityMode: true,
  },
} as const;

export default function ConnectGaloy(props: Props) {
  const { instance } = props;
  const { url, label, website, i18nPrefix, logo, apiCompatibilityMode } =
    galoyUrls[instance];

  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector",
  });
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>();
  const [currency, setCurrency] = useState<string>("BTC");

  function handleAuthTokenChange(event: React.ChangeEvent<HTMLInputElement>) {
    setAuthToken(event.target.value.trim());
  }

  function handleCurrencyChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setCurrency(event.target.value);
  }

  async function loginWithAuthToken(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const meQuery = {
      query: `
          query getinfo {
            me {
              defaultAccount {
                wallets {
                  walletCurrency
                  id
                }
              }
            }
          }
        `,
    };
    try {
      if (!authToken) {
        const errorMsg = `${t("galoy.errors.missing_token")}`;
        throw new Error(errorMsg);
      }

      const headers = galoyUrls[instance].getHeaders(authToken);

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
        // Find the BTC wallet and get its ID
        const btcWallet = meData.data.me.defaultAccount.wallets.find(
          (w: Wallet) => w.walletCurrency === currency
        );
        const walletId = btcWallet.id;
        saveAccount({ headers, walletId, currency });
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

  async function saveAccount(config: {
    headers: Headers;
    walletId: string;
    currency: string;
  }) {
    setLoading(true);

    const account = {
      name: label,
      config: {
        url,
        headers: config.headers,
        walletId: config.walletId,
        apiCompatibilityMode,
        currency: config.currency,
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
      onSubmit={loginWithAuthToken}
      description={
        <Trans
          i18nKey={`${i18nPrefix}.token.info`}
          t={t}
          values={{ label }}
          components={[
            <a
              href="https://dashboard.blink.sv"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
              key="Blink Dashboard"
            ></a>,
          ]}
        />
      }
    >
      {
        <div className="mt-6">
          <label
            htmlFor="authToken"
            className="block font-medium text-gray-800 dark:text-white"
          >
            {t(`${i18nPrefix}.token.label`)}
          </label>
          <div className="mt-1">
            <Input
              id="authToken"
              name="authToken"
              required
              onChange={handleAuthTokenChange}
              autoFocus={true}
            />
          </div>
        </div>
      }

      <div className="mt-6">
        <label
          htmlFor="currency"
          className="block font-medium text-gray-800 dark:text-white"
        >
          {t(`${i18nPrefix}.currency.label`)}
        </label>
        <div className="mt-1">
          <Select
            id="currency"
            name="currency"
            required
            onChange={handleCurrencyChange}
          >
            <option value="BTC">BTC</option>
            <option value="USD">USD (Stablesats)</option>
          </Select>
        </div>
      </div>
    </ConnectorForm>
  );
}

type Headers = {
  [key: string]: string;
};

type Props = {
  instance: keyof typeof galoyUrls;
};

type Wallet = {
  walletCurrency: string;
  id: string;
};
