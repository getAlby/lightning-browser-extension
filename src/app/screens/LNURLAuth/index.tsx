import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import { MouseEvent } from "react";
import { useState, useEffect } from "react";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import lnurlLib from "~/common/lib/lnurl";
import msg from "~/common/lib/msg";
import getOriginData from "~/extension/content-script/originData";
import type { LNURLAuthServiceResponse, OriginData } from "~/types";

function LNURLAuth() {
  const navState = useNavigationState();

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
    return await msg.reply({
      confirmed: true,
      remember: true,
    });
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <>
      {origin && details && (
        <div>
          <PublisherCard title={origin.name} image={origin.icon} />
          <div className="p-6">
            <dl className="shadow bg-white dark:bg-surface-02dp p-4 rounded-lg mb-8">
              <dt className="font-semibold text-gray-500">
                {origin.name} asks you to login to
              </dt>
              <dd className="mb-6 dark:text-white">{details.domain}</dd>
            </dl>
            <ConfirmOrCancel onConfirm={confirm} onCancel={reject} />
          </div>
        </div>
      )}
    </>
  );
}

export default LNURLAuth;
