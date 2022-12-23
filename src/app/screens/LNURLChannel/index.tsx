import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import ResultCard from "@components/ResultCard";
import WebsiteCard from "@components/WebsiteCard";
import axios from "axios";
import React, { useState } from "react";
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
  const { t } = useTranslation("translation", { keyPrefix: "lnurlchannel" });
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "confirm_or_cancel",
  });
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();
  const navState = useNavigationState();
  const details = navState.args?.lnurlDetails as LNURLChannelServiceResponse;
  const origin = navState.origin;
  const { uri } = details;
  const [pubkey, host] = uri.split("@");

  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function confirm() {
    try {
      setLoadingConfirm(true);
      await api.connectPeer({
        host,
        pubkey,
      });
      const infoResponse = await api.getInfo();
      const nodeId = infoResponse.node.pubkey;

      if (!nodeId) {
        toast.error(
          `No nodeId available. Your account might not support channel requests`
        );
        throw new Error(
          `No nodeId available. Your account might not support channel requests`
        );
      }

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
        t("success", { name: origin ? origin.name : details.domain })
      );

      // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
      // We assume this is OK when it is called through webln.
      if (navState.isPrompt) {
        msg.reply(callbackResponse?.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfirm(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function close(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!navState.isPrompt) {
      navigate(-1); // success will only be shown in popup, see comment above
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      {!successMessage ? (
        <Container justifyBetween maxWidth="sm">
          <div>
            {origin ? (
              <WebsiteCard
                title={origin.name}
                image={origin.icon}
                url={details.domain}
              />
            ) : (
              <WebsiteCard title={details.domain} />
            )}
            <ContentMessage
              heading={`${t("content_message.heading")}:`}
              content={uri}
            />
          </div>

          <div>
            <ConfirmOrCancel
              disabled={loadingConfirm || !uri}
              loading={loadingConfirm}
              onConfirm={confirm}
              onCancel={reject}
            />

            <p className="mb-4 text-center text-sm text-gray-400">
              <em>{tComponents("only_trusted")}</em>
            </p>
          </div>
        </Container>
      ) : (
        <Container justifyBetween maxWidth="sm">
          <ResultCard isSuccess message={successMessage} />
          <div className="my-4">
            <Button
              onClick={close}
              label={tCommon("actions.close")}
              fullWidth
            />
          </div>
        </Container>
      )}
    </div>
  );
}

export default LNURLChannel;
