import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import utils from "~/common/lib/utils";

export default function ConnectLnbits() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminkey: "",
    url: "https://legend.lnbits.com",
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
      return "nativelnbits";
    }
    // default to LNbits
    return "lnbits";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { adminkey, url } = formData;
    const account = {
      name: "LNBits",
      config: {
        adminkey,
        url,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelnbits") {
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
        console.error(validation);
        toast.error(
          `Connection failed. Do you have the correct URL and Admin Key? \n\n(${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      let message =
        "Connection failed. Do you have the correct URL and Admin Key?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title="Connect to LNbits"
      submitLoading={loading}
      submitDisabled={formData.adminkey === "" || formData.url === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="adminkey"
          label="LNbits Admin Key"
          type="text"
          required
          onChange={handleChange}
        />
      </div>
      <TextField
        id="url"
        label="LNbits URL"
        type="text"
        value={formData.url}
        required
        onChange={handleChange}
      />
    </ConnectorForm>
  );
}
