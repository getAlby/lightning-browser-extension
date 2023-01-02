import ConnectorForm from "@components/ConnectorForm";
import Select from "@components/form/Select";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ACCOUNT_CURRENCIES } from "~/common/constants";
import msg from "~/common/lib/msg";

type Currency = {
  value: ACCOUNT_CURRENCIES;
  label: string;
};

const supportedCurrencies: Currency[] = [
  {
    value: "BTC",
    label: "BTC (sats)",
  },
  {
    value: "EUR",
    label: "EUR",
  },
  {
    value: "USD",
    label: "USD",
  },
];

export default function ConnectKollidier() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: `choose_connector.kollider`,
  });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    currency: "BTC",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLInputElement>) {
    event.preventDefault();
    setLoading(true);
    const account = {
      name: `Kollider (${formData.currency.toUpperCase()})`,
      config: {
        username: formData.username,
        password: formData.password,
        currency: formData.currency,
      },
      connector: "kollider",
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
        console.error(validation);
        toast.error(
          <ConnectionErrorToast message={validation.error as string} />
        );
      }
    } catch (e) {
      console.error(e);
      let message = t("errors.connection_failed");
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title={t("page.title")}
      description={
        <Trans
          i18nKey={"page.description"}
          t={t}
          components={[
            // eslint-disable-next-line react/jsx-key
            <a
              className="underline"
              href="https://kollider.xyz/wallet"
              target="_blank"
              rel="noopener noreferrer"
            ></a>,
          ]}
        />
      }
      submitLoading={loading}
      submitDisabled={formData.username === "" || formData.password === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="username"
          label={t("username.label")}
          type="text"
          required
          value={formData.username}
          onChange={handleChange}
        />
      </div>
      <div className="mb-6">
        <TextField
          id="password"
          label={t("password.label")}
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div className="mb-6">
        <p className="font-medium text-gray-800 dark:text-white">
          {t("currency.label")}
        </p>
        <Select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
        >
          {supportedCurrencies.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </Select>
      </div>
    </ConnectorForm>
  );
}
