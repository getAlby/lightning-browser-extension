import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import ConnectionErrorToast from "@components/toasts/ConnectionErrorToast";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PasswordViewAdornment from "~/app/components/PasswordViewAdornment";
import toast from "~/app/components/Toast";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import logo from "/static/assets/icons/mynode.png";

const initialFormData = {
  url: "",
  macaroon: "",
};

export default function ConnectMyNode() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.mynode",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [hasTorSupport, setHasTorSupport] = useState(false);
  const [lndconnectUrlVisible, setLndconnectUrlVisible] = useState(false);

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
      name: "myNode",
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
      let message = "Connection failed. Are your credentials correct?";
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
          <Trans
            i18nKey={"page.title"}
            t={t}
            components={[
              // eslint-disable-next-line react/jsx-key
              <a className="underline" href="https://mynodebtc.com/"></a>,
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
      logo={logo}
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
      video="https://cdn.getalby-assets.com/connector-guides/in_extension_guide_mynode.mp4"
    >
      <div className="mt-6">
        <TextField
          id="lndconnect"
          label={t("rest_url.label")}
          type={lndconnectUrlVisible ? "text" : "password"}
          autoComplete="new-password"
          placeholder={t("rest_url.placeholder")}
          onChange={handleLndconnectUrl}
          required
          autoFocus={true}
          endAdornment={
            <PasswordViewAdornment
              onChange={(passwordView) => {
                setLndconnectUrlVisible(passwordView);
              }}
            />
          }
        />
      </div>
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
