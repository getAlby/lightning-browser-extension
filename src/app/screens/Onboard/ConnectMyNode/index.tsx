import { useState } from "react";
import { useNavigate } from "react-router-dom";
import utils from "../../../../common/lib/utils";
import Button from "../../../components/Button";
import TextField from "../../../components/Form/TextField";
import CompanionDownloadInfo from "../../../components/CompanionDownloadInfo";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

export default function ConnectMyNode() {
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
      name: "myNode",
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
          Connection failed. Are your credentials correct? \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Are your credentials correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mt-14 lg:flex space-x-8 bg-white dark:bg-gray-800 px-12 py-10">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white">
            Connect to your myNode
          </h1>
          <p className="text-gray-500 mt-6 dark:text-gray-400">
            On your myNode homepage click on the <b>Wallet</b> button for your{" "}
            <b>Lightning</b> service.
            <br />
            Now click on the <b>Pair Wallet</b> button under the <b>Status</b>{" "}
            tab. Enter your password when prompted. <br />
            Select the dropdown menu and choose a pairing option. Depending on
            your setup you can either use the <b>
              Lightning (REST + Local IP)
            </b>{" "}
            connection or the <b>Lightning (REST + Tor)</b> connection.
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <TextField
                id="lndconnect"
                label="lndconnect REST URL"
                placeholder="lndconnect://yournode:8080?..."
                onChange={handleLndconnectUrl}
                required
              />
            </div>
            {formData.url.match(/\.onion/i) && <CompanionDownloadInfo />}
          </div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <div className="lg:flex h-full justify-center items-center">
            <img src="assets/icons/satsymbol.svg" alt="sat" className="w-64" />
          </div>
        </div>
      </div>
      <div className="my-8 flex space-x-4 justify-center">
        <Button
          label="Back"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
            return false;
          }}
        />
        <Button
          type="submit"
          label="Continue"
          primary
          loading={loading}
          disabled={formData.url === "" || formData.macaroon === ""}
        />
      </div>
    </form>
  );
}
