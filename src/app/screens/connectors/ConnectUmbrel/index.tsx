import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";

const initialFormData = {
  url: "",
  macaroon: "",
};

export default function ConnectUmbrel() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.umbrel",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [hasTorSupport, setHasTorSupport] = useState(false);

  function handleLndconnectUrl(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const lndconnectUrl = event.target.value.trim();
      let lndconnect = new URL(lndconnectUrl);
      lndconnect.protocol = "http:";
      lndconnect = new URL(lndconnect.toString());
      const url = `https://${lndconnect.host}${lndconnect.pathname}`;
      let macaroon = lndconnect.searchParams.get("macaroon") || "";
      macaroon = utils.urlSafeBase64ToHex(macaroon);
      // const cert = lndconnect.searchParams.get("cert"); // TODO: handle LND certs with the native connector
      setFormData({
        ...formData,
        url,
        macaroon,
      });
    } catch (e) {
      console.error("invalid lndconnect string", e);
    }
  }

  function getConnectorType() {
    if (formData.url.match(/\.onion/i) && !hasTorSupport) {
      return "nativelnd";
    }
    // default to LND
    return "lnd";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { url, macaroon } = formData;
    const account = {
      name: "Umbrel",
      config: {
        macaroon,
        url,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelnd") {
        validation = { valid: true, error: "" };
      } else {
        validation = await msg.request("validateAccount", account);
      }

      if (validation.valid) {
        const addResult = await msg.request("addAccount", account);
        if (addResult.accountId) {
          await msg.request("selectAccount", {
            id: addResult.accountId,
          });
          navigate("/test-connection");
        }
      } else {
        toast.error(
          <ConnectionErrorToast
            message={validation.error as string}
            link={`${formData.url}/v1/getinfo`}
          />
        );
      }
    } catch (e) {
      console.error(e);
      let message = "";
      if (e instanceof Error) {
        message += `${e.message}`;
      }
      toast.error(<ConnectionErrorToast message={message} />);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title={
        <h1 className="mb-6 text-2xl font-bold dark:text-white">
          <Trans
            i18nKey={"page.title"}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <a className="underline" href="https://umbrel.com/"></a>,
            ]}
          />
        </h1>
      }
      description={
        <Trans
          i18nKey={"page.instructions"}
          t={t}
          // eslint-disable-next-line react/jsx-key
          components={[<strong></strong>, <br />]}
        />
      }
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
      image="https://cdn.getalby-assets.com/connector-guides/umbrel.png"
    >
      <TextField
        id="lndconnect"
        label={t("rest_url.label")}
        placeholder={t("rest_url.placeholder")}
        onChange={handleLndconnectUrl}
        required
        autoFocus={true}
      />
      {formData.url.match(/\.onion/i) && (
        <div className="mt-6">
          <CompanionDownloadInfo
            hasTorCallback={(hasTor: boolean) => {
              setHasTorSupport(hasTor);
            }}
          />
        </div>
      )}
    </ConnectorForm>
  );
}
