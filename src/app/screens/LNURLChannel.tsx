import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import axios from "axios";
import { useState, MouseEvent } from "react";
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
      // todo: check success
      const infoResponse = await api.getInfo();
      const nodeId = infoResponse.node.pubkey;

      const callbackResponse = await axios.get(props.details.callback, {
        params: {
          k1: props.details.k1,
          remoteid: nodeId,
        },
      });

      // TODO: check error

      setSuccessMessage(
        `Channel request sent successfully. ${props.details.k1} ${nodeId}`
      );

      // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
      // We assume this is OK when it is called through webln.
      if (props.details && props.origin) {
        msg.reply(callbackResponse.data);
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
    <div>
      <h1 className="py-2 font-bold text-lg text-center">Channel Request</h1>
      <PublisherCard title={origin.name} image={origin.icon} />
      <div className="py-4">
        <Container maxWidth="sm">
          {!successMessage ? (
            <>
              <dl className="shadow bg-white dark:bg-surface-02dp pt-4 px-4 rounded-lg mb-6 overflow-hidden">
                <dt className="text-sm font-semibold text-gray-500">
                  Request a channel from the node:
                </dt>
                <dd className="text-sm mb-4 dark:text-white break-all">
                  {uri}
                </dd>
              </dl>
              <ConfirmOrCancel
                disabled={loadingConfirm || !uri}
                loading={loadingConfirm}
                onConfirm={confirm}
                onCancel={reject}
              />
            </>
          ) : (
            <SuccessMessage
              message={successMessage}
              onClose={() => window.close()}
            />
          )}
        </Container>
      </div>
    </div>
  );
}

export default LNURLChannel;
