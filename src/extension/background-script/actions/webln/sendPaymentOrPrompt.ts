import lightningPayReq from "bolt11-signet";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { getPaymentRequestAmountSats } from "~/common/utils/paymentRequest";
import { Message, Sender } from "~/types";

import { debitBudget } from "../../budget";
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
  const amountInSats = getPaymentRequestAmountSats(paymentRequestDetails);

  // amountless invoices carry no amount to check against the budget, so they
  // always require explicit confirmation
  if (amountInSats !== null && (await debitBudget(host, amountInSats))) {
    return sendPaymentWithAllowance(message);
  } else {
    return payWithPrompt(message);
  }
};

async function sendPaymentWithAllowance(message: Message) {
  try {
    const response = await sendPayment(message, { budgetReserved: true });
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

export { payWithPrompt, sendPaymentOrPrompt };
