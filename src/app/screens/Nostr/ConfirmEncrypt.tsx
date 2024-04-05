import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ContentMessage from "~/app/components/ContentMessage";
import Hyperlink from "~/app/components/Hyperlink";
import PermissionModal from "~/app/components/Permissions/PermissionModal";
import PermissionSelector from "~/app/components/Permissions/PermissionSelector";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import { OriginData, PermissionOption } from "~/types";

function NostrConfirmEncrypt() {
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const { t: tPermissions } = useTranslation("permissions");
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

  function confirm() {
    setLoading(true);
    msg.reply({
      confirm: true,
      permissionOption: permissionOption,
    });
    setLoading(false);
  }

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
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
              isSmall={true}
            />
            {message && (
              <ContentMessage
                heading={t("allow_encrypt", {
                  host: origin.host,
                })}
                content={message}
              />
            )}
            <div className="flex justify-center mb-4 gap-4">
              <Hyperlink onClick={toggleShowDetails}>
                {showDetails ? t("hide_details") : t("view_details")}
              </Hyperlink>
            </div>
            {showDetails && (
              <div className="whitespace-pre-wrap break-words p-2 mb-4 shadow bg-white rounded-lg dark:bg-surface-02dp text-gray-500 dark:text-gray-400">
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
