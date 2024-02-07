import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";
import logo from "/static/assets/icons/lightning_terminal.png";

const initialFormData = Object.freeze({
  pairingPhrase: "",
});

export default function ConnectLnd() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.lnc",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [pairingPhraseVisible, setPairingPhraseVisible] = useState(false);

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
      title={t("page.title")}
      description={
        <Trans
          i18nKey={"page.description"}
          t={t}
          components={[
            // eslint-disable-next-line react/jsx-key
            <strong></strong>,
            // eslint-disable-next-line react/jsx-key
            <br />,
          ]}
        />
      }
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.pairingPhrase === ""}
      onSubmit={handleSubmit}
      image="https://cdn.getalby-assets.com/connector-guides/lnc.png"
    >
      <div className="mt-6">
        <TextField
          id="pairingPhrase"
          autoComplete="new-password"
          type={pairingPhraseVisible ? "text" : "password"}
          label={t("pairing_phrase.label")}
          placeholder={t("pairing_phrase.placeholder")}
          onChange={handleChange}
          required
          autoFocus={true}
          endAdornment={
            <PasswordViewAdornment
              onChange={(passwordView) => {
                setPairingPhraseVisible(passwordView);
              }}
            />
          }
        />
      </div>
    </ConnectorForm>
  );
}
