import { useState } from "react";
import { useNavigate } from "react-router-dom";

import utils from "../../../../common/lib/utils";

import Button from "../../../components/Button";
import QrcodeScanner from "../../../components/QrcodeScanner";
import TextField from "../../../components/Form/TextField";
import CompanionDownloadInfo from "../../../components/CompanionDownloadInfo";

export default function ConnectLndHub() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    uri: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    if (formData.uri.match(/\.onion/i)) {
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
      alert("Invalid LNDHub URI");
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
        console.log(validation);
        alert(
          `Connection failed. Is your LNDHub URI correct? \n\n(${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Is your LNDHub URI correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative mt-14 lg:flex space-x-8 bg-white dark:bg-gray-800 px-10 py-12">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white">
            Connect to LNDHub (BlueWallet)
          </h1>
          <p className="text-gray-500 mt-6 dark:text-gray-400">
            In BlueWallet, choose the wallet you want to connect, open it, click
            on &quot;...&quot;, click on Export/Backup to display the QR code
            and scan it with your webcam.
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <TextField
                id="uri"
                label="LNDHub Export URI"
                type="text"
                required
                placeholder="lndhub://..."
                value={formData.uri}
                onChange={handleChange}
              />
            </div>
            {formData.uri.match(/\.onion/i) && <CompanionDownloadInfo />}
            <div className="mt-6">
              <p className="text-center my-4 dark:text-white">OR</p>
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
          disabled={formData.uri === ""}
        />
      </div>
    </form>
  );
}
