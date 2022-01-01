import { parsePaymentRequest } from "invoices";

import utils from "../../../../common/lib/utils";
import { Message } from "../../../../types";

import db from "../../db";
import sendPayment from "../ln/sendPayment";

const sendPaymentOrPrompt = async (message: Message) => {
  const paymentRequest = message.args.paymentRequest;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }

  const paymentRequestDetails = parsePaymentRequest({
    request: paymentRequest,
  });

  const host = message.origin.host;
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (allowance && allowance.remainingBudget >= paymentRequestDetails.tokens) {
    return sendPaymentWithAllowance(message);
  } else {
    return payWithPrompt(message);
  }
};

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
      type: "confirmPayment",
    });
    return response;
  } catch (e) {
    console.log("Payment cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export default sendPaymentOrPrompt;
