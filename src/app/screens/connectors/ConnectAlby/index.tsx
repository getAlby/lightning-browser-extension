import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import msg from "~/common/lib/msg";
import { WebLNNode } from "~/extension/background-script/connectors/connector.interface";

export default function ConnectAlby() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t: tCommon } = useTranslation("common");
  async function connectAlby() {
    setLoading(true);
    const name = "Alby";
    const initialAccount = {
      name,
      config: {},
      connector: "alby",
    };

    try {
      const validation = await msg.request("validateAccount", initialAccount);
      if (validation.valid) {
        if (!validation.oAuthToken) {
          throw new Error("No oAuthToken returned");
        }

        const account = {
          ...initialAccount,
          name: (validation.info as { data: WebLNNode }).data.alias,
          config: {
            ...initialAccount.config,
            oAuthToken: validation.oAuthToken,
          },
        };

        const addResult = await msg.request("addAccount", account);
        if (addResult.accountId) {
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
      label="Connect With Alby"
      loading={loading}
      disabled={loading}
      primary
      flex
      className="w-64"
      onClick={connectAlby}
    />
  );
}
