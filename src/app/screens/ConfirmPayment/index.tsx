import { useEffect, useState } from "react";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import getOriginData from "~/extension/content-script/originData";
import type { OriginData } from "~/types";

import ConfirmPaymentForm from "./form";

function ConfirmPayment() {
  const navState = useNavigationState();

  const [paymentRequest, setPaymentRequest] = useState("");
  const [origin, setOrigin] = useState<OriginData>();

  useEffect(() => {
    if (navState.args?.paymentRequest && navState.origin) {
      const paymentRequest = navState.args.paymentRequest as string;
      setPaymentRequest(paymentRequest);

      setOrigin(navState.origin);
    } else if (navState.paymentRequest) {
      const paymentRequest = navState.paymentRequest;
      setPaymentRequest(paymentRequest);
      setOrigin(getOriginData());
    } else {
      throw new Error("Not a paymentRequest LNUrl");
    }
  }, [navState]);

  return (
    <>
      {origin && paymentRequest && (
        <ConfirmPaymentForm
          origin={origin}
          paymentRequest={paymentRequest}
          isPrompt={navState.isPrompt}
        />
      )}
    </>
  );
}

export default ConfirmPayment;
