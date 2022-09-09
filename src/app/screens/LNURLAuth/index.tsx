import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import { useState } from "react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { LNURLAuthServiceResponse } from "~/types";

function LNURLAuth() {
  const navigate = useNavigate();

  const navState = useNavigationState();

  const details = navState.args?.lnurlDetails as LNURLAuthServiceResponse;
  const origin = navState.origin;

  const { t } = useTranslation("components", {
    keyPrefix: "confirm_or_cancel",
  });

  const [successMessage, setSuccessMessage] = useState("");

  async function confirm() {
    try {
      const response = await api.lnurlAuth({
        origin,
        lnurlDetails: details,
      });

      if (navState.isPrompt && origin?.host) {
        const allowance = await api.getAllowance(origin.host);

        if (allowance.lnurlAuth === false) {
          await utils.call("updateAllowance", {
            id: allowance.id,
            lnurlAuth: true,
          });
        }
      }

      if (response.success) {
        setSuccessMessage("Authenticated successfully.");
      } else {
        throw new Error("Auth status is not ok");
      }

      // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
      // We assume this is OK when it is called through webln.
      if (navState.isPrompt) {
        msg.reply(response);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
      }
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function close(e: MouseEvent) {
    // will never be reached via prompt
    e.preventDefault();
    navigate(-1);
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={"Authentication"} />
      {!successMessage ? (
        <>
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
                heading={`Do you want to login to ${
                  origin ? origin.name : details.domain
                }?`}
                content={details.domain}
              />
            </div>

            <div>
              <ConfirmOrCancel
                label="Login"
                onConfirm={confirm}
                onCancel={reject}
              />

              <p className="mb-4 text-center text-sm text-gray-400">
                <em>{t("only_trusted")}</em>
              </p>
            </div>
          </Container>
        </>
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

export default LNURLAuth;
