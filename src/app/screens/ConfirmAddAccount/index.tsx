import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Hyperlink from "~/app/components/Hyperlink";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import getOS from "~/common/utils/os";
import type { OriginData } from "~/types";

function ConfirmAddAccount() {
  const navState = useNavigationState();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_add_account",
  });

  const name = navState.args?.name as string;
  const connector = navState.args?.connector as string;
  const config = navState.args?.config as unknown;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const isTor = connector.startsWith("native");

  async function confirm() {
    try {
      setLoading(true);
      const response = await msg.request(
        "addAccount",
        { name, connector, config },
        { origin }
      );
      msg.reply(response);
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

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <Container justifyBetween maxWidth="sm">
        <div>
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
          />
          {/* TODO: Replace with Alert component */}
          {isTor && (
            <div className="mt-4 rounded-md font-medium p-4 text-blue-700 bg-blue-50 dark:text-blue-200 dark:bg-blue-900">
              <p>
                {t("tor_info")}
                <br />
                <br />
                <Hyperlink
                  className="text-white hover:text-gray-300"
                  href={`https://getalby.com/install/companion/${getOS()}`}
                >
                  ⬇️ {tCommon("actions.download")}
                </Hyperlink>
              </p>
            </div>
          )}
          <ContentMessage
            heading={t("content", {
              connector: tCommon(
                `connectors.${connector as "lndhub"}` /* Type hack */
              ),
            })}
            content={name}
          />
        </div>
        <ConfirmOrCancel
          disabled={loading}
          loading={loading}
          onConfirm={confirm}
          onCancel={reject}
        />
      </Container>
    </div>
  );
}

export default ConfirmAddAccount;
