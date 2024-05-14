import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import {
  PopiconsChevronBottomLine,
  PopiconsChevronTopLine,
} from "@popicons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmOrCancel from "~/app/components/ConfirmOrCancel";
import ContentMessage from "~/app/components/ContentMessage";
import PermissionModal from "~/app/components/Permissions/PermissionModal";
import PermissionSelector from "~/app/components/Permissions/PermissionSelector";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import msg from "~/common/lib/msg";
import { OriginData, PermissionOption } from "~/types";

function NostrConfirmEncrypt() {
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const { t: tPermissions } = useTranslation("permissions");
  const { t: tCommon } = useTranslation("common");
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;

  const recipientNpub = navState.args?.encrypt.recipientNpub;
  const message = navState.args?.encrypt.message;

  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [permissionOption, setPermissionOption] = useState<PermissionOption>(
    PermissionOption.ASK_EVERYTIME
  );

  async function confirm() {
    try {
      setLoading(true);
      msg.reply({
        confirm: true,
        permissionOption: permissionOption,
        blocked: false,
      });
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
        permissionOption: permissionOption,
        blocked: true,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleShowDetails() {
    setShowDetails((current) => !current);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <form onSubmit={handleSubmit} className="h-full">
        <Container justifyBetween maxWidth="sm">
          <div>
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={origin.host}
            />
            {message && (
              <ContentMessage
                heading={t("allow", {
                  publisher: origin.host,
                  action: tPermissions("nostr.encrypt.title"),
                })}
                content={message}
              />
            )}
            <div
              className="flex justify-center items-center mb-4 text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400 text-sm cursor-pointer"
              onClick={toggleShowDetails}
            >
              {tCommon("details")}
              {showDetails ? (
                <PopiconsChevronTopLine className="h-4 w-4 inline-flex" />
              ) : (
                <PopiconsChevronBottomLine className="h-4 w-4 inline-flex" />
              )}
            </div>
            {showDetails && (
              <div className="whitespace-pre-wrap break-words p-2 mb-4 text-gray-600 dark:text-gray-400">
                {t("recipient")}: {recipientNpub}
              </div>
            )}
          </div>
          <div className="text-center flex flex-col gap-4">
            <PermissionModal
              isOpen={modalOpen}
              onClose={() => {
                setModalOpen(false);
              }}
              permissionCallback={(permission) => {
                setPermissionOption(permission);
                setModalOpen(false);
              }}
              permission={tPermissions("nostr.encrypt.title")}
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
                permission: tPermissions("nostr.encrypt.title"),
              }}
              onChange={() => setModalOpen(true)}
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default NostrConfirmEncrypt;
