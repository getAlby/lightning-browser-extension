import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
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
