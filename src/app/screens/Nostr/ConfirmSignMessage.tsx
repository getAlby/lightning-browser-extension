import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import {
  PopiconsChevronBottomLine,
  PopiconsChevronTopLine,
  PopiconsCircleInfoLine,
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
  const hasKind3Warning = navState.args?.hasKind3Warning as boolean;
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
                    components={[
                      // eslint-disable-next-line react/jsx-key
                      <a
                        href={`https://nostrbook.dev/kinds/${event.kind}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <PopiconsCircleInfoLine className="inline-flex w-4 h-4 ml-1" />
                      </a>,
                    ]}
                  />
                }
                content={content}
              />
              {hasKind3Warning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {t("follow_list_warning_title")}
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>{t("follow_list_warning_description")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
