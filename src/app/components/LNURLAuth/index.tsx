import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import ResultCard from "@components/ResultCard";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { LNURLAuthServiceResponse } from "~/types";

function LNURLAuthComponent() {
  const { t } = useTranslation("translation", { keyPrefix: "lnurlauth" });
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();
  const navState = useNavigationState();

  const details = navState.args?.lnurlDetails as LNURLAuthServiceResponse;
  const origin = navState.origin;

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    try {
      setLoading(true);
      const response = await api.lnurlAuth({
        origin,
        lnurlDetails: details,
      });

      if (navState.isPrompt && origin?.host) {
        const allowance = await api.getAllowance(origin.host);

        if (allowance.lnurlAuth === false) {
          await msg.request("updateAllowance", {
            id: allowance.id,
            lnurlAuth: true,
          });
        }
      }

      if (response.success) {
        setSuccessMessage(
          t("success", { name: origin ? origin.name : details.domain })
        );
        // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
        // We assume this is OK when it is called through webln.
        if (navState.isPrompt) {
          msg.reply(response);
        }
      } else {
        setErrorMessage(t("errors.status"));
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setErrorMessage(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
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
    // will never be reached via prompt
    e.preventDefault();
    navigate(-1);
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
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
                heading={`${t("content_message.heading")} ${
                  origin ? origin.name : details.domain
                }?`}
                content={details.domain}
              />

              {errorMessage && (
                <p className="my-2 mx-5 text-red-500">{errorMessage}</p>
              )}
            </div>
            <ConfirmOrCancel
              label={t("submit")}
              onConfirm={confirm}
              onCancel={reject}
              disabled={loading}
              loading={loading}
            />
          </Container>
        </>
      ) : (
        <Container justifyBetween maxWidth="sm">
          <ResultCard isSuccess message={successMessage} />
          <div className="mt-4">
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

export default LNURLAuthComponent;
