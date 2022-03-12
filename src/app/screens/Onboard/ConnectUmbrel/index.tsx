import { useState } from "react";
import browser from "webextension-polyfill";
import { parse } from "@runcitadel/lndconnect";

import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";

import utils from "../../../../common/lib/utils";

const initialFormData = Object.freeze({
  url: "",
});

export default function ConnectLnd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType(url: string) {
    if (url.match(/\.onion/i)) {
      return "nativelnd";
    }
    // default to LND
    return "lnd";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { url: lndConnectUrl } = formData;
    const { host, macaroon } = parse(lndConnectUrl);
    const account = {
      name: "LND (lndconnect)",
      config: {
        macaroon,
        url: `http://${host}`,
      },
      connector: getConnectorType(host),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelnd") {
        validation = { valid: true, error: "" };
        const permissionGranted = await browser.permissions.request({
          permissions: ["nativeMessaging"],
        });
        if (!permissionGranted) {
          validation = {
            valid: false,
            error: "Native permissions are required to connect through Tor.",
          };
        }
      } else {
        validation = {
          valid: false,
          error: "Non-tor connections are not yet supported.",
        };
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
            Connect to your Umbrel node
          </h1>
          <p className="text-gray-500 mt-6 dark:text-gray-400">
            Go to the Umbrel dashboard, select &quot;Connect wallet&quot;, then
            select &quot;lndconnect REST (Tor)&quot; and copy the displayed URL.
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="url"
                className="block font-medium text-gray-700 dark:text-white"
              >
                Address
              </label>
              <div className="mt-1">
                <Input
                  name="url"
                  id="url"
                  placeholder="lndconnect://"
                  onChange={handleChange}
                  required
                />
              </div>
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
          disabled={formData.url === ""}
        />
      </div>
    </form>
  );
}
