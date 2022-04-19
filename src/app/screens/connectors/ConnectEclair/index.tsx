import { useState } from "react";
import { useNavigate } from "react-router-dom";

import utils from "~/common/lib/utils";

import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";

export default function ConnectEclair() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    url: "http://localhost:8080",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { password, url } = formData;
    const account = {
      name: "Eclair",
      config: {
        password,
        url,
      },
      connector: "eclair",
    };

    try {
      const validation = await utils.call("validateAccount", account);
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
          `Connection failed. Do you have the correct URL and password? \n\n(${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      let message =
        "Connection failed. Do you have the correct URL and password?";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title="Connect to Eclair"
      submitLoading={loading}
      submitDisabled={formData.password === "" || formData.url === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="password"
          label="Eclair Password"
          type="text"
          required
          onChange={handleChange}
        />
      </div>
      <TextField
        id="url"
        label="Eclair URL"
        type="text"
        value={formData.url}
        required
        onChange={handleChange}
      />
    </ConnectorForm>
  );
}
