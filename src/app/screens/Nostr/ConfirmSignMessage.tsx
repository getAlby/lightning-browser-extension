import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import Checkbox from "@components/form/Checkbox";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Hyperlink from "~/app/components/Hyperlink";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import { Event } from "~/extension/providers/nostr/types";
import type { OriginData } from "~/types";

function ConfirmSignMessage() {
  const navState = useNavigationState();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const navigate = useNavigate();

  const event = navState.args?.event as Event;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [rememberPermission, setRememberPermission] = useState(false);
  const [showJSON, setShowJSON] = useState(false);

  // TODO: refactor: the success message and loading will not be displayed because after the reply the prompt is closed.
  async function confirm() {
    try {
      setLoading(true);
      msg.reply({
        blocked: false,
        enabled: rememberPermission,
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
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
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

  function toggleShowJSON() {
    setShowJSON((current) => !current);
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
              <ContentMessage
                heading={t("allow_sign_event", {
                  host: origin.host,
                  kind: t(`kinds.${event.kind}`, {
                    defaultValue: t("kinds.unknown", { kind: event.kind }),
                  }),
                })}
                content={event.content || t("no_content")}
              />
              <div className="flex justify-center mb-4 gap-4">
                <Hyperlink onClick={toggleShowJSON}>
                  {showJSON ? t("hide_details") : t("view_details")}
                </Hyperlink>
              </div>
              {showJSON && (
                <div className="whitespace-pre-wrap break-words p-2 mb-4 shadow bg-white rounded-lg dark:bg-surface-02dp text-gray-500 dark:text-gray-400">
                  {JSON.stringify(event, null, 2)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center mb-4">
                <Checkbox
                  id="remember_permission"
                  name="remember_permission"
                  checked={rememberPermission}
                  onChange={(event) => {
                    setRememberPermission(event.target.checked);
                  }}
                />
                <label
                  htmlFor="remember_permission"
                  className="cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white"
                >
                  {tCommon("actions.remember")}
                </label>
              </div>
              <ConfirmOrCancel
                disabled={loading}
                loading={loading}
                onCancel={reject}
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

export default ConfirmSignMessage;
