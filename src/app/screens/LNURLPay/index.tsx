import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import lnurlLib from "~/common/lib/lnurl";
import getOriginData from "~/extension/content-script/originData";
import { LNURLPayServiceResponse, OriginData } from "~/types";

import LNURLPayForm from "./LNURLPayForm";

const errorMessage = "Not a payRequest LNURL";

const LNURLPay = () => {
  const navState = useNavigationState();

  const [details, setDetails] = useState<LNURLPayServiceResponse>();
  const [origin, setOrigin] = useState<OriginData>();

  useEffect(() => {
    if (navState.origin) {
      setOrigin(navState.origin);
    } else {
      setOrigin(getOriginData());
    }
  }, [navState.origin]);

  const updateDetails = (lnurlDetails: LNURLPayServiceResponse) => {
    if (lnurlDetails.tag === "payRequest") {
      setDetails(lnurlDetails);
    } else {
      console.error(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const getDetails = async (lnurl: string) => {
    try {
      const lnurlDetails = await lnurlLib.getDetails(lnurl); // throws if invalid
      return lnurlDetails;
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
      }
    }
  };

  useEffect(() => {
    if (navState.args?.lnurlDetails) {
      updateDetails(navState.args?.lnurlDetails as LNURLPayServiceResponse);
    }

    if (navState.lnurl) {
      (async () => {
        const details = navState.lnurl && (await getDetails(navState.lnurl));
        details && updateDetails(details as LNURLPayServiceResponse);
      })();
    }
  }, [navState.lnurl, navState.args?.lnurlDetails]);

  return (
    <>
      {origin && details && (
        <LNURLPayForm
          origin={origin}
          details={details}
          isPrompt={navState.isPrompt}
        />
      )}
    </>
  );
};

export default LNURLPay;
