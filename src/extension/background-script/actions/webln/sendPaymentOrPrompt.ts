import lightningPayReq from "bolt11-signet";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { getPaymentRequestAmountSats } from "~/common/utils/paymentRequest";
import { Message, Sender } from "~/types";

import {
  BudgetReservation,
  persistBudget,
  releaseBudget,
  reserveBudget,
} from "../../budget";
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
  const reservation =
    amountInSats === null ? null : await reserveBudget(host, amountInSats);

  if (reservation) {
    return sendPaymentWithAllowance(message, reservation);
  } else {
    return payWithPrompt(message);
  }
};

async function sendPaymentWithAllowance(
  message: Message,
  reservation: BudgetReservation
) {
  let response;
  try {
    response = await sendPayment(message, { budgetReserved: true });
  } catch (e) {
    await releaseBudget(reservation);
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
    return;
  }

  if (!response || "error" in response) {
    await releaseBudget(reservation);
  } else {
    await persistBudget();
  }
  return response;
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
