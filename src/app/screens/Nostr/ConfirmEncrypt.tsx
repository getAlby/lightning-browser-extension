import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ContentMessage from "~/app/components/ContentMessage";
import Hyperlink from "~/app/components/Hyperlink";
import ScreenHeader from "~/app/components/ScreenHeader";
import Checkbox from "~/app/components/form/Checkbox";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import { OriginData } from "~/types";

function NostrConfirmEncrypt() {
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr",
  });
  const { t: tCommon } = useTranslation("common");
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;

  const recipientNpub = navState.args?.encrypt.recipientNpub;
  const message = navState.args?.encrypt.message;

  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [rememberPermission, setRememberPermission] = useState(true);

  function confirm() {
    setLoading(true);
    msg.reply({
      confirm: true,
      rememberPermission,
    });
    setLoading(false);
  }

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  async function block(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await msg.request("addBlocklist", {
      domain: origin.domain,
      host: origin.host,
    });
    alert(`Added ${origin.host} to the blocklist, please reload the website`);
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
          <div className="text-center flex flex-col">
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
              label={tCommon("actions.confirm")}
              onCancel={reject}
            />
            <a
              className="mt-4 underline text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap"
              href="#"
              onClick={block}
            >
              {t("block_and_ignore", { host: origin.host })}
            </a>
          </div>
        </Container>
      </form>
    </div>
  );
}

export default NostrConfirmEncrypt;
