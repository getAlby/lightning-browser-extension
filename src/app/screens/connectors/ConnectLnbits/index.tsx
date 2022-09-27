import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

export default function ConnectLnbits() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.lnbits",
  });
  const [formData, setFormData] = useState({
    adminkey: "",
    url: "https://legend.lnbits.com",
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
      return "nativelnbits";
    }
    // default to LNbits
    return "lnbits";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { adminkey, url } = formData;
    const account = {
      name: "LNBits",
      config: {
        adminkey,
        url,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelnbits") {
        validation = { valid: true, error: "" };
      } else {
        validation = await utils.call("validateAccount", account);
      }

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
      description={t("page.instructions")}
      submitLoading={loading}
      submitDisabled={formData.adminkey === "" || formData.url === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="lnbits-adminkey"
          label={t("admin_key.label")}
          placeholder={t("admin_key.placeholder")}
          type="text"
          required
          onChange={handleChange}
        />
      </div>
      <div className="mb-6">
        <TextField
          id="url"
          label={t("url.label")}
          type="text"
          value={formData.url}
          required
          onChange={handleChange}
        />
      </div>
      {formData.url.match(/\.onion/i) && (
        <div className="mb-6">
          <CompanionDownloadInfo
            hasTorCallback={() => {
              setHasTorSupport(true);
            }}
          />
        </div>
      )}
    </ConnectorForm>
  );
}
