import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Alert from "~/app/components/Alert";
import ConfirmOrCancel from "~/app/components/ConfirmOrCancel";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import msg from "~/common/lib/msg";
import { parseDelegation } from "~/common/utils/nostrSigning";
import { type OriginData } from "~/types";

function ConfirmSignSchnorr() {
  const navState = useNavigationState();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const { t: tPermissions } = useTranslation("permissions");
  const navigate = useNavigate();

  const message = (navState.args?.message as string | undefined) || "";
  const delegation = parseDelegation(message);
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // TODO: refactor: the success message and loading will not be displayed because after the reply the prompt is closed.
  async function confirm() {
    try {
      setLoading(true);
      msg.reply({
        blocked: false,
        confirm: true,
      });
      setSuccessMessage(tCommon("success"));
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLAnchorElement>) {
    try {
      setLoading(true);
      msg.reply({
        blocked: true,
        confirm: false,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function close(e: React.MouseEvent<HTMLButtonElement>) {
    if (navState.isPrompt) {
      window.close();
    } else {
      e.preventDefault();
      navigate(-1);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      {!successMessage ? (
        <form onSubmit={handleSubmit} className="h-full">
          <Container justifyBetween maxWidth="sm">
            <div>
              <PublisherCard
                title={origin.name}
                image={origin.icon}
                url={origin.host}
              />
              {delegation ? (
                <>
                  <ContentMessage
                    heading={t("allow", {
                      publisher: origin.host,
                      action: t("signschnorr.delegation.action"),
                    })}
                  />
                  <dl>
                    <dt className="text-sm text-gray-800 dark:text-neutral-200">
                      {t("signschnorr.delegation.delegatee")}
                    </dt>
                    <dd className="mb-4 text-gray-600 dark:text-neutral-400 break-all">
                      {delegation.delegatee}
                    </dd>
                    <dt className="text-sm text-gray-800 dark:text-neutral-200">
                      {t("signschnorr.delegation.conditions")}
                    </dt>
                    <dd className="mb-4 text-gray-600 dark:text-neutral-400 break-all">
                      {delegation.conditions}
                    </dd>
                  </dl>
                  <Alert type="warn">
                    {t("signschnorr.delegation.warning")}
                  </Alert>
                </>
              ) : (
                <>
                  <ContentMessage
                    heading={t("allow", {
                      publisher: origin.host,
                      action: tPermissions("nostr.signschnorr.title"),
                    })}
                    content={message}
                  />
                  <Alert type="warn">{t("signschnorr.warning")}</Alert>
                </>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <ConfirmOrCancel
                disabled={loading}
                loading={loading}
                onCancel={reject}
                cancelLabel={tCommon("actions.deny")}
                destructive
              />
            </div>
          </Container>
        </form>
      ) : (
        <Container maxWidth="sm">
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
          />
          <SuccessMessage message={successMessage} onClose={close} />
        </Container>
      )}
    </div>
  );
}

export default ConfirmSignSchnorr;
