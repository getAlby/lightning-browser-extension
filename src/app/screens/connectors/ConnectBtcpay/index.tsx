import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";

import logo from "/static/assets/icons/btcpay.svg";

const initialFormData = {
  url: "",
  macaroon: "",
  name: "",
};

export default function ConnectBtcpay() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.btcpay",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [hasTorSupport, setHasTorSupport] = useState(false);

  function getConfigUrl(data: string) {
    const configUrl = data.trim().replace("config=", "");
    try {
      return new URL(configUrl);
    } catch (e) {
      return null;
    }
  }
  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const configUrl = getConfigUrl(event.target.value);
    if (!configUrl) {
      return;
    }
    const host = configUrl.host;
    try {
      const response = await axios.get<{
        configurations: [{ uri: string; adminMacaroon: string }];
      }>(configUrl.toString(), { adapter: fetchAdapter });

      if (response.data.configurations[0].uri) {
        setFormData({
          url: response.data.configurations[0].uri,
          macaroon: response.data.configurations[0].adminMacaroon,
          name: host,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(t("errors.connection_failed"));
    }
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
    const { url, macaroon, name } = formData;
    const account = {
      name: name || "LND",
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
      title={t("page.title")}
      description={t("page.instructions")}
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
    >
      <TextField
        id="btcpay-config"
        label={t("config.label")}
        placeholder={t("config.placeholder")}
        onChange={handleChange}
        required
        autoFocus={true}
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
