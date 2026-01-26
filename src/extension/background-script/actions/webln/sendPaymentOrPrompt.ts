import lightningPayReq from "bolt11-signet";
import lnurlLib from "~/common/lib/lnurl";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";
import { Message, Sender } from "~/types";

import db from "../../db";
import sendPayment from "../ln/sendPayment";
import lnurlPayWithPrompt from "../lnurl/pay";

const sendPaymentOrPrompt = async (message: Message, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const paymentRequest = message.args.paymentRequest;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }

  if (lnurlLib.isLightningAddress(paymentRequest)) {
    try {
      const lnurlDetails = await lnurlLib.getDetails(paymentRequest);
      if (isLNURLDetailsError(lnurlDetails)) {
        return { error: lnurlDetails.reason };
      }
      if (lnurlDetails.tag === "payRequest") {
        return lnurlPayWithPrompt(message, lnurlDetails);
      }
    } catch (e) {
      console.error(e);
      // Fallback to regular flow or return error?
      // If it looks like an address but fails resolution, it's safer to return the error
      // than to try and decode it as a BOLT11 which will definitely fail.
      if (e instanceof Error) {
        return { error: e.message };
      }
    }
    return { error: "Failed to resolve Lightning Address" };
  }

  let paymentRequestDetails;
  try {
    paymentRequestDetails = lightningPayReq.decode(paymentRequest);
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
  }

  if (
    paymentRequestDetails &&
    (await checkAllowance(host, paymentRequestDetails.satoshis || 0))
  ) {
    return sendPaymentWithAllowance(message);
  } else {
    return payWithPrompt(message);
  }
};

async function checkAllowance(host: string, amount: number) {
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  return allowance && allowance.remainingBudget > amount; // check that the budget is higher than the amount. amount can be 0
}

async function sendPaymentWithAllowance(message: Message) {
  try {
    const response = await sendPayment(message);
    return response;
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

async function payWithPrompt(message: Message) {
  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmPayment",
    });
    return response;
  } catch (e) {
    console.error("Payment cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export { checkAllowance, payWithPrompt, sendPaymentOrPrompt };
