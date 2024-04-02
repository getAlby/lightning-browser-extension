import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";

import logo from "/static/assets/icons/nwc.svg";

export default function ConnectNWC() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.nwc",
  });
  const [formData, setFormData] = useState({
    nostrWalletConnectUrl: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    return "nwc";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { nostrWalletConnectUrl } = formData;
    const account = {
      name: "NWC",
      config: {
        nostrWalletConnectUrl,
      },
      connector: getConnectorType(),
    };

    try {
      const validation = await msg.request("validateAccount", account);
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
      let message = t("page.errors.connection_failed");
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
        <h1 className="text-2xl font-bold dark:text-white">
          <Trans i18nKey={"title"} t={t} />
        </h1>
      }
      description={
        <Trans
          i18nKey={"page.instructions"}
          t={t}
          components={[
            // eslint-disable-next-line react/jsx-key
            <a
              target="_blank"
              rel="noreferrer"
              className="underline"
              href="https://nwc.getalby.com"
            ></a>,
            // eslint-disable-next-line react/jsx-key
            <a
              target="_blank"
              rel="noreferrer"
              className="underline"
              href="https://apps.umbrel.com/app/alby-nostr-wallet-connect"
            ></a>,
            // eslint-disable-next-line react/jsx-key
            <a
              target="_blank"
              rel="noreferrer"
              className="underline"
              href="https://www.mutinywallet.com"
            ></a>,
          ]}
        />
      }
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.nostrWalletConnectUrl === ""}
      onSubmit={handleSubmit}
    >
      <div className="mt-4 mb-6">
        <TextField
          id="nostrWalletConnectUrl"
          label={t("page.url.label")}
          placeholder={t("page.url.placeholder")}
          required
          onChange={handleChange}
          autoFocus={true}
          type="password"
        />
      </div>
    </ConnectorForm>
  );
}
