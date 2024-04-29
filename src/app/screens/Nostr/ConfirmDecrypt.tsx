import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
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

function NostrConfirmDecrypt() {
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const { t: tPermissions } = useTranslation("permissions");
  const { t: tCommon } = useTranslation("common");

  const navState = useNavigationState();
  const origin = navState.origin as OriginData;

  const [loading, setLoading] = useState(false);

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
            <ContentMessage
              heading={t("allow", {
                publisher: origin.host,
                action: tPermissions("nostr.decrypt.title"),
              })}
            />
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
              permission={tPermissions("nostr.decrypt.title")}
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
                permission: tPermissions("nostr.decrypt.title"),
              }}
              onChange={() => setModalOpen(true)}
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default NostrConfirmDecrypt;
