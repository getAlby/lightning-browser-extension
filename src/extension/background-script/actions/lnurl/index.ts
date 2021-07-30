import axios from "axios";
import { parsePaymentRequest } from "invoices";

import utils from "../../../../common/lib/utils";
import state from "../../state";
import { bech32Decode } from "../../../../common/utils/helpers";
import { publishPaymentNotification } from "../ln/sendpayment";

async function lnurl(message) {
  try {
    const lnurlDecoded = bech32Decode(message.args.lnurlEncoded);
    const url = new URL(lnurlDecoded);
    let lnurlType = url.searchParams.get("tag");
    let lnurlDetails;

    if (lnurlType === "login") {
      lnurlDetails = {
        k1: url.searchParams.get("k1"),
        action: url.searchParams.get("action"),
      };
    } else {
      const res = await axios.get(lnurlDecoded);
      lnurlDetails = res.data;
      lnurlType = res.data.tag;
    }

    switch (lnurlType) {
      case "channelRequest":
        console.log("lnurl-channel");
        return;
      case "login":
        console.log("lnurl-auth");
        console.log(lnurlDetails);
        return;
      case "payRequest":
        return payWithPrompt(message, lnurlDetails);
      case "withdrawRequest":
        console.log("lnurl-withdraw");
        return;
      default:
        return;
    }
  } catch (e) {
    console.log(e.message);
  }
}

async function payWithPrompt(message, lnurlDetails) {
  await utils.openPrompt({
    ...message,
    type: "lnurlPay",
    args: { ...message.args, lnurlDetails },
  });
}

export async function lnurlPay(message, sender) {
  const { paymentRequest, successCallback } = message.args;
  const connector = state.getState().getConnector();
  const paymentRequestDetails = parsePaymentRequest({
    request: paymentRequest,
  });

  try {
    const response = await connector.sendPayment({
      paymentRequest,
    });
    publishPaymentNotification(
      message.args.message,
      paymentRequestDetails,
      response
    );

    if (successCallback) successCallback();

    return response;
  } catch (e) {
    console.log(e.message);
  }
}

export default lnurl;
