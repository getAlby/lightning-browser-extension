import { useState } from "react";
import { useNavigate } from "react-router-dom";

import utils from "~/common/lib/utils";

import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import CompanionDownloadInfo from "@components/CompanionDownloadInfo";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

export default function ConnectUmbrel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  function handleLndconnectUrl(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const lndconnectUrl = event.target.value.trim();
      const lndconnect = new URL(lndconnectUrl);
      const url = "https:" + lndconnect.pathname;
      let macaroon = lndconnect.searchParams.get("macaroon") || "";
      macaroon = utils.urlSafeBase64ToHex(macaroon);
      // const cert = lndconnect.searchParams.get("cert"); // TODO: handle LND certs with the native connector
      setFormData({
        ...formData,
        url,
        macaroon,
      });
    } catch (e) {
      console.log("invalid lndconnect string");
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
        alert(`
          Connection failed. Are your Umbrel credentials correct? \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Are your Umbrel credentials correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
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
