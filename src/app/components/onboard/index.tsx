import { PopiconsClockLine, PopiconsKeyLeftLine } from "@popicons/react";
import { useTranslation } from "react-i18next";
import ConfirmOrCancel from "~/app/components/ConfirmOrCancel";
import Container from "~/app/components/Container";
import PublisherCard from "~/app/components/PublisherCard";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useAccount } from "~/app/context/AccountContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import PopiconsCircleInfoLine from "~/app/icons/popicons/CircleInfoLine";
import { NO_KEYS_ERROR, USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import { OriginData } from "~/types";

export default function Onboard() {
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;
  const action = navState.action as string;

  const { account: authAccount } = useAccount();

  const { t } = useTranslation("translation", {
    keyPrefix: "onboard",
  });

  function openOptions(path: string) {
    utils.openPage(`options.html#/${path}`);
  }

  async function keySetup() {
    const account = await api.getAccount(authAccount?.id);
    if (action === "public/nostr/onboard" && account.hasMnemonic) {
      openOptions(`accounts/${authAccount?.id}/nostr/settings`);
    } else {
      openOptions(`accounts/${authAccount?.id}/secret-key/new`);
    }

    await msg.error(NO_KEYS_ERROR);
  }

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
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
            isSmall={false}
          />
          <div className="dark:text-white pt-6">
            <div className="mb-2 flex items-center">
              <PopiconsKeyLeftLine className="w-7 h-7 mr-2" />
              <p>{t("request1")}</p>
            </div>
            <div className="mb-2 flex items-center">
              <PopiconsCircleInfoLine className="w-7 h-7 mr-2" />
              <p>{t("request2")}</p>
            </div>
            <div className="mb-2 flex items-center">
              <PopiconsClockLine className="w-7 h-7 mr-2" />
              <p>{t("request3")}</p>
            </div>
          </div>
        </div>
        <div className="text-center flex flex-col">
          <ConfirmOrCancel
            label={t("actions.start_setup")}
            onConfirm={keySetup}
            onCancel={reject}
          />
        </div>
      </Container>
    </div>
  );
}
