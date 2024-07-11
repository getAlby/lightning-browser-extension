import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import { PopiconsCheckLine } from "@popicons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Alert from "~/app/components/Alert";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import type { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};
function WebbtcEnableComponent(props: Props) {
  const [loading, setLoading] = useState(false);
  const hasHttp = props.origin.domain.startsWith("http://");
  const { t } = useTranslation("translation", {
    keyPrefix: "webbtc_enable",
  });
  const { t: tCommon } = useTranslation("common");

  const enable = () => {
    try {
      setLoading(true);
      msg.reply({
        enabled: true,
        remember: true,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  async function block(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await msg.request("addBlocklist", {
      domain: props.origin.domain,
      host: props.origin.host,
    });
    alert(tCommon("enable.block_added", { host: props.origin.host }));
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <Container justifyBetween maxWidth="sm">
        <div>
          <PublisherCard
            title={props.origin.name}
            image={props.origin.icon}
            url={props.origin.host}
            isSmall={false}
          />

          <div className="pt-3">
            {hasHttp && (
              <Alert type="warn">
                {tCommon("enable.insecure_domain_warn")}
              </Alert>
            )}
          </div>

          <div className="dark:text-white pt-6">
            <p className="mb-2">{tCommon("enable.allow")}</p>

            <div className="mb-2 flex items-center">
              <PopiconsCheckLine className="w-5 h-5 mr-2" />
              <p className="dark:text-white">{tCommon("enable.request1")}</p>
            </div>
            <div className="mb-2 flex items-center">
              <PopiconsCheckLine className="w-5 h-5 mr-2" />
              <p className="dark:text-white">{t("request2")}</p>
            </div>
          </div>
        </div>
        <div className="text-center flex flex-col">
          <ConfirmOrCancel
            disabled={loading}
            loading={loading}
            label={tCommon("actions.connect")}
            onConfirm={enable}
            onCancel={reject}
          />
          <a
            className="mt-4 underline text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap"
            href="#"
            onClick={block}
          >
            {tCommon("enable.block_and_ignore", { host: props.origin.host })}
          </a>
        </div>
      </Container>
    </div>
  );
}

export default WebbtcEnableComponent;
