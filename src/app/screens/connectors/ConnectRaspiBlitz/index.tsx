import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";
import TextField from "@components/form/TextField";
import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

export default function ConnectRaspiBlitz() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

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
    if (formData.url.match(/\.onion/i)) {
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
        toast.error(`
          Connection failed. Are your RaspiBlitz credentials correct? \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message =
        "Connection failed. Are your RaspiBlitz credentials correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title="Connect to your RaspiBlitz node"
      description={
        <p>
          You need your node onion address, port, and a macaroon with read and
          send permissions (e.g. admin.macaroon).
          <br />
          <br />
          <strong>SSH</strong> into your <strong>RaspiBlitz</strong>.<br />
          Run the command{" "}
          <strong>sudo cat /mnt/hdd/tor/lndrest8080/hostname</strong>.
          <br />
          Copy and paste the <strong>.onion</strong> address in the input below.
          <br />
          Add your <strong>port</strong> after the onion address, the default
          port is <strong>:8080</strong>.
        </p>
      }
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
      video="https://cdn.getalby-assets.com/connector-guides/in_extension_guide_raspiblitz.mp4"
    >
      <div className="mt-6">
        <TextField
          id="url"
          label="REST API host"
          placeholder="your-node-onion-address:port"
          onChange={handleUrl}
          required
        />
      </div>
      {formData.url.match(/\.onion/i) && <CompanionDownloadInfo />}
      <div className="mt-6">
        <p className="mb-6 text-gray-500 mt-6 dark:text-gray-400">
          Select <b>CONNECT</b>.<br />
          Select <b>EXPORT</b>.<br />
          Select <b>HEX</b>.<br />
          Copy the <b>adminMacaroon</b>.<br />
          Paste the macaroon in the input below.
        </p>
        <div>
          <TextField
            id="macaroon"
            label="Macaroon (HEX format)"
            value={formData.macaroon}
            onChange={handleMacaroon}
            required
          />
        </div>
      </div>
    </ConnectorForm>
  );
}
