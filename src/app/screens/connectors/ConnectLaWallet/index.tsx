import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";

import Button from "~/app/components/Button";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import LaWalletToast from "~/app/screens/connectors/ConnectLaWallet/LaWalletToast";
import LaWallet, {
  HttpError,
} from "~/extension/background-script/connectors/lawallet";
import Nostr from "~/extension/background-script/nostr";
import { ConnectorType } from "~/types";
import logo from "/static/assets/icons/lawallet.png";

const initialFormData = {
  private_key: "",
  api_endpoint: "https://api.lawallet.ar",
  identity_endpoint: "https://lawallet.ar",
  ledger_public_key:
    "bd9b0b60d5cd2a9df282fc504e88334995e6fac8b148fa89e0f8c09e2a570a84",
  urlx_public_key:
    "e17feb5f2cf83546bcf7fd9c8237b05275be958bd521543c2285ffc6c2d654b3",
  relay_url: "wss://relay.lawallet.ar",
};

export default function ConnectLaWallet() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.lawallet",
  });
  const [passwordViewVisible, setPasswordViewVisible] = useState(false);
  const { t: tCommon } = useTranslation("common");
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function getConnectorType(): ConnectorType {
    return "lawallet";
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const {
      private_key,
      api_endpoint,
      identity_endpoint,
      ledger_public_key,
      urlx_public_key,
      relay_url,
    } = formData;

    const domain = identity_endpoint.replace(/https?:\/\//, "");

    let username;
    try {
      const publicKey = new Nostr(private_key).getPublicKey();
      const response = await LaWallet.request<{ username: string }>(
        identity_endpoint,
        "GET",
        `/api/pubkey/${publicKey}`,
        undefined
      );
      username = response.username;
    } catch (e) {
      if (e instanceof HttpError && e.status === 404) {
        toast.error(<LaWalletToast domain={domain} />, {
          position: "top-center",
        });
      } else {
        toast.error(<ConnectionErrorToast message={(e as Error).message} />);
      }

      setLoading(false);
      return;
    }

    const account = {
      name: `${username}@${domain}`,
      config: {
        privateKey: private_key,
        apiEndpoint: api_endpoint,
        identityEndpoint: identity_endpoint,
        ledgerPublicKey: ledger_public_key,
        urlxPublicKey: urlx_public_key,
        relayUrl: relay_url,
      },
      connector: getConnectorType(),
    };

    await msg.request("validateAccount", account);

    try {
      const addResult = await msg.request("addAccount", account);
      if (addResult.accountId) {
        await msg.request("selectAccount", {
          id: addResult.accountId,
        });
        navigate("/test-connection");
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
      submitDisabled={formData.private_key === ""}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col space-y-6">
        <TextField
          id="private_key"
          label={t("private_key")}
          placeholder={t("private_key")}
          onChange={handleChange}
          type={passwordViewVisible ? "text" : "password"}
          required
          autoFocus={true}
          endAdornment={
            <PasswordViewAdornment
              onChange={(passwordView) => {
                setPasswordViewVisible(passwordView);
              }}
            />
          }
        />

        <TextField
          id="identity_endpoint"
          label={t("identity_endpoint")}
          value={formData.identity_endpoint}
          required
          title={t("identity_endpoint")}
          onChange={handleChange}
        />

        <Button
          onClick={() => {
            setShowAdvanced(!showAdvanced);
          }}
          label={tCommon("advanced")}
        />
      </div>
      {showAdvanced && (
        <div className="mt-6 flex flex-col space-y-6">
          <TextField
            id="api_endpoint"
            label={t("api_endpoint")}
            value={formData.api_endpoint}
            required
            title={t("api_endpoint")}
            onChange={handleChange}
          />

          <TextField
            id="ledger_public_key"
            label={t("ledger_public_key")}
            value={formData.ledger_public_key}
            required
            title={t("ledger_public_key")}
            onChange={handleChange}
          />
          <TextField
            id="urlx_public_key"
            label={t("urlx_public_key")}
            value={formData.urlx_public_key}
            required
            title={t("urlx_public_key")}
            onChange={handleChange}
          />
          <TextField
            id="relay_url"
            label={t("relay_url")}
            value={formData.relay_url}
            required
            title={t("relay_url")}
            onChange={handleChange}
          />
        </div>
      )}
    </ConnectorForm>
  );
}
