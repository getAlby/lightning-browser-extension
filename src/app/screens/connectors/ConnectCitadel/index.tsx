import {
  HiddenIcon,
  VisibleIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

export default function ConnectCitadel() {
  const navigate = useNavigate();
  const [passwordView, setPasswordView] = useState(false);
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
          Connection failed. Is your password correct? \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message = "Connection failed. Is your password correct?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title="Connect to your Citadel Node"
      description="This currently doesn't work if 2FA is enabled."
      submitLoading={loading}
      submitDisabled={formData.password === "" || formData.url === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          label="Password"
          id="password"
          type={passwordView ? "text" : "password"}
          required
          onChange={handleChange}
          endAdornment={
            <button
              type="button"
              className="flex justify-center items-center w-10 h-8"
              onClick={() => setPasswordView(!passwordView)}
            >
              {passwordView ? (
                <HiddenIcon className="h-6 w-6" />
              ) : (
                <VisibleIcon className="h-6 w-6" />
              )}
            </button>
          }
        />
      </div>
      <TextField
        label="Citadel URL"
        id="url"
        placeholder="citadel.local"
        type="text"
        value={formData.url}
        required
        onChange={handleChange}
      />
    </ConnectorForm>
  );
}
