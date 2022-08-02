import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import axios from "axios";
import { useState, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import getOriginData from "~/extension/content-script/originData";
import type { LNURLChannelServiceResponse } from "~/types";

type Props = {
  details: LNURLChannelServiceResponse;
  origin?: {
    name: string;
    icon: string;
  };
};

function LNURLChannel(props: Props) {
  const [origin] = useState(props.origin || getOriginData());
  const { uri } = props.details;
  const [pubkey, host] = uri.split("@");

  const { t } = useTranslation("components", {
    keyPrefix: "confirmOrCancel",
  });

  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function confirm() {
    try {
      setErrorMessage("");
      setLoadingConfirm(true);
      await api.connectPeer({
        host,
        pubkey,
      });
      const infoResponse = await api.getInfo();
      const nodeId = infoResponse.node.pubkey;

      const callbackResponse = await axios.get(props.details.callback, {
        params: {
          k1: props.details.k1,
          remoteid: nodeId,
        },
      });

      if (axios.isAxiosError(callbackResponse)) {
        toast.error(`Failed to call callback: ${callbackResponse.message}`);
        throw new Error(`Failed to call callback: ${callbackResponse.message}`);
      }

      setSuccessMessage(
        `Channel request sent successfully. ${props.details.k1} ${nodeId}`
      );

      // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
      // We assume this is OK when it is called through webln.
      if (props.details && props.origin) {
        msg.reply(callbackResponse?.data);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
    } finally {
      setLoadingConfirm(false);
    }
  }

  function reject(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center text-xl font-semibold dark:text-white py-2 border-b border-gray-200 dark:border-neutral-500">
        Channel Request
      </div>
      {!successMessage ? (
        <div className="h-full flex flex-col justify-between">
          <div>
            <PublisherCard title={origin.name} image={origin.icon} />
            <dl className="shadow bg-white dark:bg-surface-02dp rounded-lg p-4 m-4 overflow-hidden">
              <dt className="mb-1 text-sm font-semibold text-gray-500">
                Request a channel from the node:
              </dt>
              <dd className="text-sm dark:text-white break-all">{uri}</dd>
            </dl>

            {errorMessage && (
              <p className="mt-1 text-red-500">{errorMessage}</p>
            )}
          </div>
          <div>
            <ConfirmOrCancel
              disabled={loadingConfirm || !uri}
              loading={loadingConfirm}
              onConfirm={confirm}
              onCancel={reject}
            />
            <p className="mb-4 text-center italic text-sm text-gray-400">
              {t("only_trusted")}
            </p>
          </div>
        </div>
      ) : (
        <>
          <PublisherCard title={origin.name} image={origin.icon} />
          <div className="m-4">
            <SuccessMessage
              message={successMessage}
              onClose={() => window.close()}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default LNURLChannel;
