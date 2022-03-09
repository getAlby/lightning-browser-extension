import { useState } from "react";

import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";

import utils from "../../../../common/lib/utils";

import browser from "webextension-polyfill";

export default function ConnectCitadel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    url: "http://citadel.local",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    if (formData.url.match(/\.onion/i)) {
      return "nativecitadel";
    }
    return "citadel";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { password, url } = formData;
    /** The URL with an http:// in front if the protocol is missing */
    const fullUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `http://${url}`;
    const account = {
      name: "Citadel",
      config: {
        url: fullUrl,
        password,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativecitadel") {
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
          Connection failed. Is your password correct? \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Is your password correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative lg:flex mt-14 bg-white dark:bg-gray-800 px-10 py-12">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white">
            Connect to your Citadel Node
          </h1>
          <p className="text-gray-500 mt-6">
            This currently doesn&apos;t work if 2FA is enabled.
          </p>
          <div className="w-4/5">
            <div className="mt-6">
              <label
                htmlFor="password"
                className="block font-medium text-gray-700 dark:text-gray-400"
              >
                Password
              </label>
              <div className="mt-1">
                <Input
                  name="password"
                  type="password"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor="url"
                className="block font-medium text-gray-700 dark:text-gray-400"
              >
                Citadel URL
              </label>
              <div className="mt-1">
                <Input
                  name="url"
                  placeholder="citadel.local"
                  type="text"
                  value={formData.url}
                  required
                  onChange={handleChange}
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
          disabled={formData.password === "" || formData.url === ""}
        />
      </div>
    </form>
  );
}
