import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import QrcodeScanner from "@components/QrcodeScanner";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";

import logo from "/static/assets/icons/lndhub_go.png";

export default function ConnectLndHub() {
  const navigate = useNavigate();

  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.lndhub_go",
  });
  const [formData, setFormData] = useState({
    uri: "",
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
    if (formData.uri.match(/\.onion/i) && !hasTorSupport) {
      return "nativelndhub";
    }
    // default to LndHub
    return "lndhub";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const match = formData.uri.match(/lndhub:\/\/(\S+):(\S+)@(\S+)/i);
    if (!match) {
      toast.error(t("errors.invalid_uri"));
      setLoading(false);
      return;
    }
    const login = match[1];
    const password = match[2];
    const url = match[3].replace(/\/$/, "");
    const account = {
      name: "LNDHub",
      config: {
        login,
        password,
        url,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelndhub") {
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
        } else {
          console.error("Failed to add account", addResult);
          throw new Error(addResult.error as string);
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
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.uri === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="uri"
          label={t("uri.label")}
          required
          placeholder="lndhub://..."
          pattern="lndhub://.+"
          title="lndhub://..."
          value={formData.uri}
          onChange={handleChange}
          autoFocus={true}
        />
      </div>
      {formData.uri.match(/\.onion/i) && (
        <div className="mb-6">
          <CompanionDownloadInfo
            hasTorCallback={(hasTor: boolean) => {
              setHasTorSupport(hasTor);
            }}
          />
        </div>
      )}
      <div>
        <p className="text-center my-6 dark:text-white">OR</p>
        <QrcodeScanner
          fps={10}
          qrbox={250}
          qrCodeSuccessCallback={(decodedText: string) => {
            if (formData.uri !== decodedText) {
              setFormData({
                ...formData,
                uri: decodedText,
              });
            }
          }}
          qrCodeErrorCallback={console.error}
        />
      </div>
    </ConnectorForm>
  );
}
