import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import axios from "axios";
import { useState, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { LNURLChannelServiceResponse } from "~/types";

function LNURLChannel() {
  const navState = useNavigationState();
  const details = navState.args?.lnurlDetails as LNURLChannelServiceResponse;
  const navigate = useNavigate();

  const { uri } = details;
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

      const callbackResponse = await axios.get(details.callback, {
        params: {
          k1: details.k1,
          remoteid: nodeId,
        },
      });

      if (axios.isAxiosError(callbackResponse)) {
        toast.error(`Failed to call callback: ${callbackResponse.message}`);
        throw new Error(`Failed to call callback: ${callbackResponse.message}`);
      }

      setSuccessMessage(
        `Channel request sent successfully. ${details.k1} ${nodeId}`
      );

      // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
      // We assume this is OK when it is called through webln.
      if (details && navState.origin) {
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
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={"Channel Request"} />
      {!successMessage ? (
        <Container isScreenView maxWidth="sm">
          <div>
            <PublisherCard
              title={navState.origin.name}
              image={navState.origin.icon}
            />
            <ContentMessage
              heading={`Request a channel from the node:`}
              content={uri}
            />

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

            <p className="mb-4 text-center text-sm text-gray-400">
              <em>{t("only_trusted")}</em>
            </p>
          </div>
        </Container>
      ) : (
        <Container maxWidth="sm">
          <PublisherCard
            title={navState.origin.name}
            image={navState.origin.icon}
            url={details.domain}
          />
          <div className="m-4">
            <SuccessMessage
              message={successMessage}
              onClose={() => window.close()}
            />
          </div>
        </Container>
      )}
    </div>
  );
}

export default LNURLChannel;
