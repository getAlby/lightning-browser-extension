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
  const navigate = useNavigate();
  const navState = useNavigationState();
  const details = navState.args?.lnurlDetails as LNURLChannelServiceResponse;
  const origin = navState?.origin;
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
      if (navState.isPrompt) {
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

  function close(e: MouseEvent) {
    e.preventDefault();
    if (!navState.isPrompt) {
      navigate(-1); // success will only be shown in popup, see comment above
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={"Channel Request"} />
      {!successMessage ? (
        <Container justifyBetween maxWidth="sm">
          <div>
            {origin ? (
              <PublisherCard
                title={origin.name}
                image={origin.icon}
                url={details.domain}
              />
            ) : (
              <PublisherCard title={details.domain} />
            )}
            <ContentMessage
              heading={`Request a channel from the node:`}
              content={uri}
            />

            {errorMessage && (
              <p className="my-2 mx-5 text-red-500">{errorMessage}</p>
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
          {origin ? (
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={details.domain}
            />
          ) : (
            <PublisherCard title={details.domain} />
          )}

          <div className="my-4">
            <SuccessMessage message={successMessage} onClose={close} />
          </div>
        </Container>
      )}
    </div>
  );
}

export default LNURLChannel;
