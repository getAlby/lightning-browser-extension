import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Hyperlink from "~/app/components/Hyperlink";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";
import logo from "/static/assets/icons/voltage.png";

const initialFormData = {
  url: "",
  macaroon: "",
};

export default function ConnectVoltage() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.voltage",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [macaroonVisible, setMacaroonVisible] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    return "lnd";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { url, macaroon } = formData;
    const account = {
      name: "Voltage",
      config: {
        macaroon,
        url,
      },
      connector: getConnectorType(),
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
          <ConnectionErrorToast
            message={validation.error as string}
            link={formData.url}
          />,
          // Don't auto-close
          { duration: 100_000 }
        );
      }
    } catch (e) {
      console.error(e);
      let message = "";
      if (e instanceof Error) {
        message += `${e.message}`;
      }
      toast.error(
        <ConnectionErrorToast
          message={message}
          link={`${formData.url}/v1/getinfo`}
        />
      );
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
            <Hyperlink
              key="link"
              href="https://www.getalby.com/voltage"
              target="_blank"
              rel="noreferrer noopener"
            />,
          ]}
        />
      }
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
    >
      <div className="my-6">
        <TextField
          id="url"
          label={t("url.label")}
          placeholder={t("url.placeholder")}
          pattern="https?://.+"
          title={t("url.placeholder")}
          onChange={handleChange}
          required
          autoFocus={true}
        />
      </div>
      <div>
        <TextField
          id="macaroon"
          type={macaroonVisible ? "text" : "password"}
          autoComplete="new-password"
          label={t("macaroon.label")}
          value={formData.macaroon}
          onChange={handleChange}
          required
          endAdornment={
            <PasswordViewAdornment
              onChange={(passwordView) => {
                setMacaroonVisible(passwordView);
              }}
            />
          }
        />
      </div>
    </ConnectorForm>
  );
}
