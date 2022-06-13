import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

const initialFormData = {
  url: "",
  macaroon: "",
};

export default function ConnectUmbrel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  function handleLndconnectUrl(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const lndconnectUrl = event.target.value.trim();
      let lndconnect = new URL(lndconnectUrl);
      lndconnect.protocol = "http:";
      lndconnect = new URL(lndconnect.toString());
      const url = `https://${lndconnect.host}${lndconnect.pathname}`;
      let macaroon = lndconnect.searchParams.get("macaroon") || "";
      macaroon = utils.urlSafeBase64ToHex(macaroon);
      // const cert = lndconnect.searchParams.get("cert"); // TODO: handle LND certs with the native connector
      setFormData({
        ...formData,
        url,
        macaroon,
      });
    } catch (e) {
      console.error("invalid lndconnect string", e);
    }
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
      name: "Umbrel",
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
          Connection failed. Are your Umbrel credentials correct? \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Are your Umbrel credentials correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title="Connect to your Umbrel node"
      description={
        <p>
          In your Umbrel dashboard go to <strong>Connect Wallet</strong>.<br />
          Select <strong>lndconnect REST</strong> and copy the{" "}
          <strong>lndconnect URL</strong>. (Depending on your setup you can
          either use the <em>local</em> connection or the <em>Tor</em>{" "}
          connection.)
        </p>
      }
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
      video="https://cdn.getalby-assets.com/connector-guides/in_extension_guide_umbrel.mp4"
    >
      <TextField
        id="lndconnect"
        label="lndconnect REST URL"
        placeholder="lndconnect://yournode:8080?..."
        onChange={handleLndconnectUrl}
        required
      />
      {formData.url.match(/\.onion/i) && (
        <div className="mt-6">
          <CompanionDownloadInfo />
        </div>
      )}
    </ConnectorForm>
  );
}
