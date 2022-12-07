import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import * as secp256k1 from "@noble/secp256k1";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import msg from "~/common/lib/msg";

export default function ConnectCommando() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: `choose_connector.commando`,
  });
  const { t: tCommon } = useTranslation("common");
  const [formData, setFormData] = useState({
    host: "",
    pubkey: "",
    rune: "",
    port: 9735,
    privateKey: generateCommandoPrivateKey(),
    proxy: "wss://lnproxy.getalby.com",
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [commandoPrivateKeyVisible, setCommandoPrivateKeyVisible] =
    useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    return "commando";
  }

  function generateCommandoPrivateKey(): string {
    const privKey = secp256k1.utils.randomPrivateKey();
    return secp256k1.utils.bytesToHex(privKey);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const host = formData.host;
    const pubkey = formData.pubkey;
    const rune = formData.rune;
    const port = formData.port;
    const wsProxy = formData.proxy;
    const privateKey = formData.privateKey;
    const account = {
      name: "commando",
      config: {
        host,
        pubkey,
        rune,
        port,
        wsProxy,
        privateKey,
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
      submitDisabled={
        formData.host === "" && formData.pubkey === "" && formData.rune === ""
      }
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="host"
          label={t("host.label")}
          type="text"
          required
          placeholder="0.0.0.0"
          title="host"
          value={formData.host}
          onChange={handleChange}
        />
      </div>
      <div className="mb-6">
        <TextField
          id="pubkey"
          label={t("pubkey.label")}
          type="text"
          required
          placeholder="02...."
          title="pubkey"
          value={formData.pubkey}
          onChange={handleChange}
        />
      </div>
      <div className="mb-6">
        <TextField
          id="rune"
          label={t("rune.label")}
          type="text"
          required
          placeholder=""
          title="rune"
          value={formData.rune}
          onChange={handleChange}
        />
      </div>
      <div className="mb-6">
        <TextField
          id="port"
          label={t("port.label")}
          type="number"
          required
          title="port"
          value={formData.port}
          onChange={handleChange}
        />
      </div>
      <Button
        onClick={() => {
          setShowAdvanced(!showAdvanced);
        }}
        label={tCommon("advanced")}
      />
      {showAdvanced && (
        <div className="mt-6">
          <div className="mb-6">
            <TextField
              id="proxy"
              label={t("proxy.label")}
              type="text"
              placeholder="proxy"
              required
              title="proxy"
              value={formData.proxy}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <TextField
              id="commandoPrivateKey"
              label={t("privKey.label")}
              type={commandoPrivateKeyVisible ? "text" : "password"}
              value={formData.privateKey}
              endAdornment={
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex justify-center items-center w-10 h-8"
                  onClick={() => {
                    setCommandoPrivateKeyVisible(!commandoPrivateKeyVisible);
                  }}
                >
                  {commandoPrivateKeyVisible ? (
                    <HiddenIcon className="h-6 w-6" />
                  ) : (
                    <VisibleIcon className="h-6 w-6" />
                  )}
                </button>
              }
            />
          </div>
        </div>
      )}
    </ConnectorForm>
  );
}
