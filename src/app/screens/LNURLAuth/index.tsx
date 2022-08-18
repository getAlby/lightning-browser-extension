import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import type { AxiosResponse } from "axios";
import PubSub from "pubsub-js";
import { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { LNURLAuthServiceResponse } from "~/types";

function LNURLAuth() {
  const navigate = useNavigate();

  const navState = useNavigationState();
  const details = navState.args?.lnurlDetails as LNURLAuthServiceResponse & {
    url: string;
  };
  const origin = navState.origin;

  const { t } = useTranslation("components", {
    keyPrefix: "confirmOrCancel",
  });

  async function confirm() {
    try {
      const response = (await api.lnurlAuth({
        origin,
        lnurlDetails: details,
      })) as unknown as AxiosResponse;

      if (navState.isPrompt) {
        // if the service returned with a HTTP 200 we still check if the response data is OK
        if (response?.data.status.toUpperCase() !== "OK") {
          PubSub.publish(`lnurl.auth.failed`, {
            authResponse: response,
            details,
            origin,
          });
        }

        const allowance = await api.getAllowance(origin.host);
        await utils.call("updateAllowance", {
          id: allowance.id,
          lnurlAuth: true,
        });

        PubSub.publish(`lnurl.auth.success`, {
          authResponse: response,
          details,
          origin,
        });

        return await msg.reply(response);
      } else {
        navigate(-1);
      }
    } catch (e) {
      if (e instanceof Error) {
        PubSub.publish(`lnurl.auth.failed`, {
          error: e.message,
          details,
          origin,
        });
      }
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <Container isScreenView maxWidth="sm">
      <div>
        <PublisherCard
          title={origin.name}
          image={origin.icon}
          url={details.domain}
        />
        <ContentMessage
          heading={`${origin.name} asks you to login to`}
          content={details.domain}
        />
      </div>

      <div>
        <ConfirmOrCancel label="Login" onConfirm={confirm} onCancel={reject} />

        <p className="mb-4 text-center text-sm text-gray-400">
          <em>{t("only_trusted")}</em>
        </p>
      </div>
    </Container>
  );
}

export default LNURLAuth;
