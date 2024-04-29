import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ConfirmOrCancel from "~/app/components/ConfirmOrCancel";
import PermissionModal from "~/app/components/Permissions/PermissionModal";
import PermissionSelector from "~/app/components/Permissions/PermissionSelector";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import msg from "~/common/lib/msg";
import { PermissionOption, type OriginData } from "~/types";

function ConfirmSignSchnorr() {
  const navState = useNavigationState();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const { t: tPermissions } = useTranslation("permissions");
  const navigate = useNavigate();

  const sigHash = navState.args?.sigHash as string;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [permissionOption, setPermissionOption] = useState<PermissionOption>(
    PermissionOption.ASK_EVERYTIME
  );

  // TODO: refactor: the success message and loading will not be displayed because after the reply the prompt is closed.
  async function confirm() {
    try {
      setLoading(true);
      msg.reply({
        blocked: false,
        confirm: true,
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
        blocked: true,
        confirm: false,
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
                heading={t("allow", {
                  publisher: origin.host,
                  action: tPermissions("nostr.signschnorr.title"),
                })}
                content={sigHash}
              />
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
                permission={tPermissions("nostr.signschnorr.title")}
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
                  permission: tPermissions("nostr.signschnorr.title"),
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

export default ConfirmSignSchnorr;
