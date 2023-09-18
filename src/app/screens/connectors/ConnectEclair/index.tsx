import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";
import logo from "/static/assets/icons/eclair.jpg";

export default function ConnectEclair() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.eclair",
  });
  const [formData, setFormData] = useState({
    password: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordViewVisible, setPasswordViewVisible] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { password, url } = formData;
    const account = {
      name: "Eclair",
      config: {
        password,
        url,
      },
      connector: "eclair",
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
      let message = "";
      if (e instanceof Error) {
        message += `${e.message}`;
      }
      toast.error(<ConnectionErrorToast message={message} />);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title={
        <h1 className="text-2xl font-bold dark:text-white">
          <Trans
            i18nKey={"page.title"}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <a
                className="underline"
                href="https://github.com/ACINQ/eclair"
              ></a>,
            ]}
          />
        </h1>
      }
      description={t("page.instructions")}
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.password === "" || formData.url === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="url"
          label={t("url.label")}
          placeholder={t("url.placeholder")}
          value={formData.url}
          required
          onChange={handleChange}
        />
      </div>
      <TextField
        id="password"
        autoComplete="new-password"
        label={t("password.label")}
        type={passwordViewVisible ? "text" : "password"}
        required
        autoFocus={true}
        onChange={handleChange}
        endAdornment={
          <PasswordViewAdornment
            onChange={(passwordView) => {
              setPasswordViewVisible(passwordView);
            }}
          />
        }
      />
    </ConnectorForm>
  );
}
