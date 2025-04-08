import { PopiconsFaceSmileLine, PopiconsKeyLine } from "@popicons/react";
import { useTranslation } from "react-i18next";
import ConfirmOrCancel from "~/app/components/ConfirmOrCancel";
import Container from "~/app/components/Container";
import PublisherCard from "~/app/components/PublisherCard";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useAccount } from "~/app/context/AccountContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import PopiconsCircleInfoLine from "~/app/icons/popicons/CircleInfoLine";
import { NO_KEYS_ERROR, USER_REJECTED_ERROR } from "~/common/constants";
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

  const actionToKeyMap: Record<string, string> = {
    "public/nostr/enable": "enableNostr",
    "public/liquid/enable": "enableLiquid",
    "public/webbtc/enable": "enableBitcoin",
  };

  const keyPrefix = actionToKeyMap[action] || "default";

  async function keySetup() {
    openOptions(`accounts/${authAccount?.id}/secret-key/new`);
    await msg.error(NO_KEYS_ERROR);
  }

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  const request1 = t(`${keyPrefix}.request1` as const, {
    defaultValue: t("default.request1"),
  });
  const request2 = t(`${keyPrefix}.request2` as const, {
    defaultValue: t("default.request2"),
  });

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
          <div className="text-gray-600 dark:text-neutral-400 text-sm pt-6">
            <div className="mb-3 flex gap-2 items-center">
              <PopiconsKeyLine className="w-5 h-5" />
              <p>{request1}</p>
            </div>
            <div className="mb-3 flex gap-2 items-center">
              <PopiconsCircleInfoLine className="w-5 h-5" />
              <p>{request2}</p>
            </div>
            <div className="mb-3 flex gap-2 items-center">
              <PopiconsFaceSmileLine className="w-5 h-5" />
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
