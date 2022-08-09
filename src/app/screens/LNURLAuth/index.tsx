import ConfirmOrCancel from "@components/ConfirmOrCancel";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import { MouseEvent } from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import lnurlLib from "~/common/lib/lnurl";
import msg from "~/common/lib/msg";
import getOriginData from "~/extension/content-script/originData";
import type {
  LNURLAuthServiceResponse,
  OriginData,
  LNURLDetails,
} from "~/types";

function LNURLAuth() {
  const navState = useNavigationState();
  const navigate = useNavigate();
  const { t } = useTranslation("components", {
    keyPrefix: "confirmOrCancel",
  });

  const [details, setDetails] = useState<LNURLAuthServiceResponse>();
  const [origin, setOrigin] = useState<OriginData>();

  useEffect(() => {
    if (navState?.args?.lnurlDetails && navState?.origin) {
      const lnurlDetails = navState.args
        .lnurlDetails as LNURLAuthServiceResponse;
      if (lnurlDetails.tag === "login") {
        setDetails(lnurlDetails);
        setOrigin(navState.origin);
      }
    } else if (navState.lnurl) {
      const lnurl = navState.lnurl;

      (async () => {
        const lnurlDetails = await lnurlLib.getDetails(lnurl);
        if (lnurlDetails.tag === "login") {
          setDetails(lnurlDetails);
          setOrigin(getOriginData());
        }
      })();
    } else {
      throw new Error("Not a login LNURL");
    }
  }, [navState]);

  async function confirm() {
    if (navState.isPrompt) {
      return await msg.reply({
        confirmed: true,
        remember: true,
      });
    } else {
      if (!origin || !details) return;

      // send message to auth without prompt?

      // const lnurlDetails: LNURLDetails = {
      //   ...details,
      //   url: origin.host as unknown as URL,
      // };

      // await authViaPopup({
      //   loginStatus: {
      //     confirmed: true,
      //     remember: true,
      //   },
      //   origin,
      //   lnurlDetails,
      // });
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  return (
    <>
      {origin && details && (
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar justify-between">
          <div>
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={details.domain}
            />
            <ContentMessage
              heading={`${origin.name} asks you to login to`}
              content={details.domain}
            />
          </div>

          <div>
            <ConfirmOrCancel
              label="Login"
              onConfirm={confirm}
              onCancel={reject}
            />
            <p className="mb-4 text-center text-sm text-gray-400">
              <em>{t("only_trusted")}</em>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default LNURLAuth;
