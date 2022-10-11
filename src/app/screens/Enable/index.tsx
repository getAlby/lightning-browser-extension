import { CheckIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

function Enable(props: Props) {
  const hasFetchedData = useRef(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("translation", {
    keyPrefix: "enable",
  });
  const { t: tCommon } = useTranslation("common");

  const enable = useCallback(() => {
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
  }, [tCommon]);

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  async function block(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await utils.call("addBlocklist", {
      domain: props.origin.domain,
      host: props.origin.host,
    });
    msg.error(
      `User added site to blocklist domain, host
        ${props.origin.domain},
        ${props.origin.host}`
    );
  }

  useEffect(() => {
    async function getAllowance() {
      try {
        const allowance = await msg.request("getAllowance", {
          domain: props.origin.domain,
          host: props.origin.host,
        });
        if (allowance && allowance.enabled) {
          enable();
        }
      } catch (e) {
        if (e instanceof Error) console.error(e.message);
      }
    }

    // Run once.
    if (!hasFetchedData.current) {
      getAllowance();
      hasFetchedData.current = true;
    }
  }, [enable, props.origin.domain, props.origin.host]);

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

          <div className="dark:text-white pt-6">
            <p className="mb-4">{t("allow", { host: props.origin.host })}</p>

            <div className="mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p className="dark:text-white">{t("request1")}</p>
            </div>
            <div className="mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p className="dark:text-white">{t("request2")}</p>
            </div>
          </div>
        </div>
        <div className="mb-4 text-center flex flex-col">
          <ConfirmOrCancel
            disabled={loading}
            loading={loading}
            label={tCommon("actions.connect")}
            onConfirm={enable}
            onCancel={reject}
          />
          <a
            className="underline text-sm text-gray-400 mx-4 overflow-hidden text-ellipsis whitespace-nowrap"
            href="#"
            onClick={block}
          >
            {t("block_and_ignore", { host: props.origin.host })}
          </a>
        </div>
      </Container>
    </div>
  );
}

export default Enable;
