import ConnectorForm from "@components/ConnectorForm";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";

import Alert from "~/app/components/Alert";
import api from "~/common/lib/api";
import logo from "/static/assets/icons/spark.png";

export default function ConnectSpark() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.spark",
  });
  const [loading, setLoading] = useState(false);

  function getConnectorType() {
    return "spark";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const mnemonic = await api.generateMnemonic();
    const encryptedMnemonic = await api.encryptKey(mnemonic);

    const nostrPrivateKey = await api.nostr.generatePrivateKey(
      undefined,
      mnemonic
    );

    const encryptedNostrPrivateKey = await api.encryptKey(nostrPrivateKey);
    const account = {
      name: "Spark",
      config: {},
      connector: getConnectorType(),
      mnemonic: encryptedMnemonic,
      useMnemonicForLnurlAuth: true,
      nostrPrivateKey: encryptedNostrPrivateKey,
      hasImportedNostrKey: false,
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
              href="https://www.spark.money/"
            ></a>,
          ]}
        />
      }
      logo={logo}
      submitLoading={loading}
      onSubmit={handleSubmit}
    >
      <Alert type="warn">
        <Trans
          i18nKey={"page.warning"}
          t={t}
          components={[
            // eslint-disable-next-line react/jsx-key
            <a
              target="_blank"
              rel="noreferrer"
              className="underline"
              href="https://docs.spark.money/wallet/developer-guide/unilateral-exit"
            ></a>,
          ]}
        />
      </Alert>
    </ConnectorForm>
  );
}
