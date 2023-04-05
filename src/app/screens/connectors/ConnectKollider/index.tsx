import Button from "@components/Button";
import ConnectorForm from "@components/ConnectorForm";
import ConnectorPath from "@components/ConnectorPath";
import PasswordForm from "@components/PasswordForm";
import Select from "@components/form/Select";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ACCOUNT_CURRENCIES } from "~/common/constants";
import msg from "~/common/lib/msg";

import kolliderLogo from "/static/assets/icons/kollider.png";

type Currency = {
  value: ACCOUNT_CURRENCIES;
  label: string;
};

export type Props = {
  variant: "login" | "create" | "select";
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

export default function ConnectKollidier({ variant }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: `choose_connector.kollider`,
  });
  const { t: tCommon } = useTranslation("common");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConfirmation: "",
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
      if (variant === "create") {
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Access-Control-Allow-Origin", "*");
        headers.append("Content-Type", "application/json");
        headers.append("X-User-Agent", "alby-extension");
        const body = JSON.stringify({
          username: formData.username,
          password: formData.password,
        });
        const res = await (
          await fetch("https://lndhubx.kollider.xyz/api/create", {
            method: "POST",
            headers,
            body,
          })
        ).json();
        if (res.error) {
          throw new Error(res.error);
        }
        if (res.username) {
          toast.success("Account created successfully!");
        }
      }

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
        if (e.message === "UserAlreadyExists") {
          message = t("errors.user_already_exists");
        }
        if (e.message === "RegistrationLimitExceeded") {
          message = t("errors.registration_limit_exceeded");
        }
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return variant === "select" ? (
    <div className="grid lg:grid-cols-4 mt-8 mb-4 lg:my-12">
      <div className="col-start-2 col-span-2">
        <ConnectorPath
          title={t("choose_path.title")}
          description={t("choose_path.description")}
          content={
            <img
              src={kolliderLogo}
              alt="logo"
              className="inline rounded-3xl w-32"
            />
          }
          actions={
            <>
              <Link to="create" className="flex flex-1">
                <Button label={t("choose_path.create_new")} primary flex />
              </Link>
              <Link to="login" className="flex flex-1">
                <Button label={tCommon("actions.log_in")} outline flex />
              </Link>
            </>
          }
        />
        <div className="mb-4 mt-8 md:my-8 flex justify-center gap-4 md:flex-row">
          <Button
            label={tCommon("actions.back")}
            onClick={(e) => {
              navigate(-1);
            }}
            className="max-sm:w-full"
          />
        </div>
      </div>
    </div>
  ) : (
    <ConnectorForm
      title={t(`${variant}.title`)}
      description={
        variant === "create" ? (
          t(`create.description`)
        ) : (
          <Trans
            i18nKey={"login.description"}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <Link
                className="underline"
                to="/accounts/new/choose-connector/kollider/create"
              ></Link>,
            ]}
          />
        )
      }
      submitLoading={loading}
      submitDisabled={
        loading ||
        formData.password === "" ||
        formData.username === "" ||
        (variant === "create" &&
          formData.password !== formData.passwordConfirmation)
      }
      onSubmit={handleSubmit}
    >
      {variant === "create" && (
        <div className="rounded-md font-medium p-4 mb-8 text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
          {t("warning")}
        </div>
      )}
      <div className="mb-6">
        <TextField
          id="username"
          label={t(`username.label`)}
          type="text"
          required
          value={formData.username}
          onChange={handleChange}
          autoFocus={true}
        />
      </div>
      <div className="mb-6">
        <PasswordForm
          i18nKeyPrefix="alby.pre_connect.set_password"
          formData={formData}
          setFormData={setFormData}
          minLength={6}
          confirm={variant === "create"}
          autoFocus={false}
        />
      </div>
      <div>
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
