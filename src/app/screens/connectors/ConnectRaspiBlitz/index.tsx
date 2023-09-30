import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";
import logo from "/static/assets/icons/raspiblitz.png";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

export default function ConnectRaspiBlitz() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.raspiblitz",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [hasTorSupport, setHasTorSupport] = useState(false);
  const [macaroonVisible, setMacaroonVisible] = useState(false);

  function handleUrl(event: React.ChangeEvent<HTMLInputElement>) {
    let url = event.target.value.trim();
    if (url.substring(0, 4) !== "http") {
      url = `https://${url}`;
    }
    setFormData({
      ...formData,
      [event.target.name]: url,
    });
  }

  function handleMacaroon(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    if (formData.url.match(/\.onion/i) && !hasTorSupport) {
      return "nativelnd";
    }
    // default to LND
    return "lnd";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { url, macaroon } = formData;
    const account = {
      name: "RaspiBlitz",
      config: {
        macaroon,
        url,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelnd") {
        validation = { valid: true, error: "" };
      } else {
        validation = await msg.request("validateAccount", account);
      }

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
            link={`${formData.url}/v1/getinfo`}
          />
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
              <a className="underline" href="https://raspiblitz.org/"></a>,
            ]}
          />
        </h1>
      }
      description={
        <Trans
          i18nKey={"page.instructions1"}
          t={t}
          components={[
            // eslint-disable-next-line react/jsx-key
            <strong></strong>,
            // eslint-disable-next-line react/jsx-key
            <br />,
          ]}
        />
      }
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
      video="https://cdn.getalby-assets.com/connector-guides/in_extension_guide_raspiblitz.mp4"
    >
      <div className="mt-6">
        <TextField
          id="url"
          label={t("rest_api_host.label")}
          placeholder={t("rest_api_host.placeholder")}
          onChange={handleUrl}
          required
          autoFocus={true}
        />
      </div>
      {formData.url.match(/\.onion/i) && (
        <CompanionDownloadInfo
          hasTorCallback={(hasTor: boolean) => {
            setHasTorSupport(hasTor);
          }}
        />
      )}
      <div className="mt-6">
        <p className="mb-6 text-gray-500 mt-6 dark:text-neutral-400">
          <Trans
            i18nKey={"page.instructions2"}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <b></b>,
              // eslint-disable-next-line react/jsx-key
              <br />,
            ]}
          />
        </p>
        <div>
          <TextField
            id="macaroon"
            type={macaroonVisible ? "text" : "password"}
            autoComplete="new-password"
            label="Macaroon (HEX format)"
            value={formData.macaroon}
            onChange={handleMacaroon}
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
      </div>
    </ConnectorForm>
  );
}
