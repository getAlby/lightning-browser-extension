import { useState, useEffect } from "react";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import lnurlLib from "~/common/lib/lnurl";
import getOriginData from "~/extension/content-script/originData";
import { LNURLPayServiceResponse, OriginData } from "~/types";

import LNURLPayForm from "./form";

function LNURLPay() {
  const navState = useNavigationState();

  const [details, setDetails] = useState<LNURLPayServiceResponse>();
  const [origin, setOrigin] = useState<OriginData>();
  const [isPrompt, setIsPrompt] = useState(false);

  useEffect(() => {
    if (navState.lnurl) {
      const lnurl = navState.lnurl;

      (async () => {
        const lnurlDetails = await lnurlLib.getDetails(lnurl);
        if (lnurlDetails.tag === "payRequest") {
          setDetails(lnurlDetails);
          setOrigin(getOriginData());
          setIsPrompt(true);
        }
      })();
    } else if (navState.args.lnurlDetails && navState.origin) {
      const lnurlDetails = navState.args
        .lnurlDetails as LNURLPayServiceResponse;
      if (lnurlDetails.tag === "payRequest") {
        setDetails(lnurlDetails);
        setOrigin(navState.origin);
      }
    } else {
      throw new Error("Not a payRequest LNUrl");
    }
  }, [navState]);

  return (
    <>
      {origin && details && (
        <LNURLPayForm origin={origin} details={details} isPrompt={isPrompt} />
      )}
    </>
  );
}

export default LNURLPay;
