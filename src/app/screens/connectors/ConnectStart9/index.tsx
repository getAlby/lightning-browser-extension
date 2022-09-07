import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

const initialFormData = {
  url: "",
  macaroon: "",
};

export default function ConnectStart9() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [hasTorSupport, setHasTorSupport] = useState(false);

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
      name: "Start9",
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
        toast.error(
          <ConnectionErrorToast
            message={validation.error as string}
            link={`${formData.url}/v1/getinfo`}
          />
        );
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Are your Embassy credentials correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title={
        <h1 className="mb-6 text-2xl font-bold dark:text-white">
          Connect to your{" "}
          <a className="underline" href="https://start9.com/latest/">
            Embassy
          </a>{" "}
          Node
        </h1>
      }
      description={
        <p>
          <strong>Note</strong>: Currently we only support LND but we will be
          adding c-lightning support in the future! <br />
          On your Embassy dashboard click on the{" "}
          <strong>Lightning Network Daemon</strong> service.
          <br />
          Select the <strong>Properties</strong> tab.
          <br /> Now copy the <strong>LND Connect REST URL</strong>.
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
