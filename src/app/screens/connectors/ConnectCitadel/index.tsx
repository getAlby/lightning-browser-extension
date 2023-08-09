import logo from "/static/assets/icons/citadel.png";
import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import msg from "~/common/lib/msg";

export default function ConnectCitadel() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.citadel",
  });
  const [passwordViewVisible, setPasswordViewVisible] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasTorSupport, setHasTorSupport] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    if (formData.url.match(/\.onion/i) && !hasTorSupport) {
      return "nativecitadel";
    }
    return "citadel";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { password, url } = formData;
    /** The URL with an http:// in front if the protocol is missing */
    const fullUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `http://${url}`;
    const account = {
      name: "Citadel",
      config: {
        url: fullUrl,
        password,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativecitadel") {
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
              <a className="underline" href="https://runcitadel.space/"></a>,
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
          label={t("password.label")}
          id="password"
          autoComplete="new-password"
          type={passwordViewVisible ? "text" : "password"}
          autoFocus={true}
          required
          onChange={handleChange}
          endAdornment={
            <PasswordViewAdornment
              onChange={(passwordView) => {
                setPasswordViewVisible(passwordView);
              }}
            />
          }
        />
      </div>
      <TextField
        label={t("url.label")}
        id="url"
        placeholder={t("url.placeholder")}
        value={formData.url}
        required
        onChange={handleChange}
      />
      {formData.url.match(/\.onion/i) && (
        <div className="mt-6">
          <CompanionDownloadInfo
            hasTorCallback={(hasTor: boolean) => {
              setHasTorSupport(hasTor);
            }}
          />
        </div>
      )}
    </ConnectorForm>
  );
}
