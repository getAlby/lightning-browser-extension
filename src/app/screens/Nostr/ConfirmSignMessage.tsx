import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import {
  PopiconsChevronBottomLine,
  PopiconsChevronTopLine,
} from "@popicons/react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ConfirmOrCancel from "~/app/components/ConfirmOrCancel";
import PermissionModal from "~/app/components/Permissions/PermissionModal";
import PermissionSelector from "~/app/components/Permissions/PermissionSelector";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import msg from "~/common/lib/msg";
import { Event, EventKind } from "~/extension/providers/nostr/types";
import { OriginData, PermissionOption } from "~/types";

function ConfirmSignMessage() {
  const navState = useNavigationState();

  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();

  const event = navState.args?.event as Event;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showJSON, setShowJSON] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionOption, setPermissionOption] = useState<PermissionOption>(
    PermissionOption.ASK_EVERYTIME
  );

  // TODO: refactor: the success message and loading will not be displayed because after the reply the prompt is closed.
  async function confirm() {
    try {
      setLoading(true);
      msg.reply({
        confirm: true,
        blocked: false,
        permissionOption: permissionOption,
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
        confirm: false,
        blocked: true,
        permissionOption: permissionOption,
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

  function toggleShowJSON() {
    setShowJSON((current) => !current);
  }

  let content = event.content || "";
  // UploadChunk event returns lengthy blob data
  if (event.kind === EventKind.UploadChunk) {
    content = "";
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
                heading={
                  <Trans
                    i18nKey="allow_sign_event"
                    t={t}
                    values={{
                      host: origin.host,
                      kind: t(`kinds.${event.kind}.title`, {
                        defaultValue: t("kinds.unknown.title", {
                          kind: event.kind,
                        }),
                      }),
                    }}
                    // eslint-disable-next-line react/jsx-key
                    components={[<i></i>]}
                  />
                }
                content={content}
              />
              <div
                className="flex justify-center items-center mb-4 text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400 text-sm cursor-pointer"
                onClick={toggleShowJSON}
              >
                {tCommon("details")}
                {showJSON ? (
                  <PopiconsChevronTopLine className="h-4 w-4 inline-flex" />
                ) : (
                  <PopiconsChevronBottomLine className="h-4 w-4 inline-flex" />
                )}
              </div>
              {showJSON && (
                <div className="whitespace-pre-wrap break-words p-2 mb-4 text-gray-600 dark:text-neutral-400">
                  {JSON.stringify(event, null, 2)}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <PermissionModal
                isOpen={modalOpen}
                onClose={() => {
                  setModalOpen(false);
                }}
                permissionCallback={(permission) => {
                  setPermissionOption(permission);
                  setModalOpen(false);
                }}
                permission={t(`kinds.${event.kind}.title`, {
                  defaultValue: t("kinds.unknown.title", {
                    kind: event.kind,
                  }),
                })}
              />
              <ConfirmOrCancel
                disabled={loading}
                loading={loading}
                onCancel={reject}
                cancelLabel={tCommon("actions.deny")}
                destructive
              />
              <PermissionSelector
                i18nKey={permissionOption}
                values={{
                  permission: t(`kinds.${event.kind}.title`, {
                    defaultValue: t("kinds.unknown.title", {
                      kind: event.kind,
                    }),
                  }),
                }}
                onChange={() => setModalOpen(true)}
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
