import lightningPayReq from "bolt11-signet";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { Message, Sender } from "~/types";

import db from "../../db";
import sendPayment from "../ln/sendPayment";

const sendPaymentOrPrompt = async (message: Message, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const paymentRequest = message.args.paymentRequest;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }

  const paymentRequestDetails = lightningPayReq.decode(paymentRequest);
  if (await checkAllowance(host, paymentRequestDetails.satoshis || 0)) {
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
