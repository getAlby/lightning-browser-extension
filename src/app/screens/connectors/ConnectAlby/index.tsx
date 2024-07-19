import { GetAccountInformationResponse } from "@getalby/sdk/dist/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "~/app/components/Button";
import toast from "~/app/components/Toast";
import { getAlbyAccountName } from "~/app/utils";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import { WebLNNode } from "~/extension/background-script/connectors/connector.interface";

export default function ConnectAlby() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_path.alby",
  });
  async function connectAlby() {
    setLoading(true);
    const name = "Alby";
    const initialAccount = {
      name,
      config: {},
      connector: "alby" as const,
    };

    try {
      const validation = await api.validateAccount(initialAccount);
      if (validation.valid) {
        if (!validation.oAuthToken) {
          throw new Error("No oAuthToken returned");
        }

        const accountInfo = validation.info.data as WebLNNode &
          GetAccountInformationResponse;

        const account = {
          ...initialAccount,
          // NOTE: name and avatarUrl will be overwritten each time the account info is reloaded
          // but also saved here so the correct information is cached
          name: getAlbyAccountName(accountInfo),
          avatarUrl: accountInfo.avatar,
          config: {
            ...initialAccount.config,
            oAuthToken: validation.oAuthToken,
          },
        };

        const addResult = await msg.request("addAccount", account);
        if (addResult.accountId) {
          // TODO: update all connectors to use api instead of msg.request
          await msg.request("selectAccount", {
            id: addResult.accountId,
          });
          navigate("/test-connection");
        } else {
          console.error("Failed to add account", addResult);
          throw new Error(addResult.error as string);
        }
      } else {
        console.error("Failed to validate account", validation);
        throw new Error(validation.error as string);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`${tCommon("errors.connection_failed")} (${e.message})`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      label={t("connect")}
      loading={loading}
      disabled={loading}
      flex
      onClick={connectAlby}
      primary
    />
  );
}
