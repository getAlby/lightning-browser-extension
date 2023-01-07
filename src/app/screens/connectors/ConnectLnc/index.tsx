import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import msg from "~/common/lib/msg";

const initialFormData = Object.freeze({
  pairingPhrase: "",
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { pairingPhrase } = formData;
    const account = {
      name: "LND",
      config: {
        pairingPhrase,
      },
      connector: "lnc",
    };

    try {
      const validation = { valid: true, error: "" }; // opening and closing a connection to fast causes some problems. I've seen "channel occupied errors" await utils.call("validateAccount", account);

      if (validation.valid) {
        const addResult = await msg.request("addAccount", account);
        if (addResult.accountId) {
          await msg.request("selectAccount", {
            id: addResult.accountId,
          });
          navigate("/test-connection");
        }
      } else {
        console.error(validation);
        toast.error(
          <ConnectionErrorToast message={validation.error as string} />
        );
      }
    } catch (e) {
      console.error(e);
      let message = "LNC connection failed";
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      toast.error(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title="Connect to your LND node"
      description="You need your Lightning Node Connect pairing phrase"
      submitLoading={loading}
      submitDisabled={formData.pairingPhrase === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="pairingPhrase"
          type="password"
          label="Pairing Phrase"
          placeholder="secret stack sats"
          title="Your Lightning Ndoe Connect Pairing Phrase"
          onChange={handleChange}
          required
        />
      </div>
    </ConnectorForm>
  );
}
