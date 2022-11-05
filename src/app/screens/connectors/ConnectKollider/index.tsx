import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

export default function ConnectKollidier() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: `choose_connector.kollider`,
  });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    currency: "EUR",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const account = {
      name: `Kollider`,
      config: {
        username: formData.username,
        password: formData.password,
        currency: formData.currency,
      },
      connector: "kollider",
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
      description={t("page.description")}
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
        <TextField
          id="currency"
          label={t("currency.label")}
          type="currency"
          required
          value={formData.currency}
          onChange={handleChange}
        />
      </div>
    </ConnectorForm>
  );
}
