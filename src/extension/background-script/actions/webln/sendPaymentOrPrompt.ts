import { parsePaymentRequest } from "invoices";

import utils from "../../../../common/lib/utils";
import { Message } from "../../../../types";

import db from "../../db";
import sendPayment from "../ln/sendPayment";
import sendPaymentKeySend from "../ln/keySend";

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
  if (await checkAllowance(message.origin.host, paymentRequestDetails.tokens)) {
    return sendPaymentWithAllowance(message, false);
  } else {
    return payWithPrompt(message, "confirmPayment");
  }
};

async function checkAllowance(host: string, amount: number) {
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  return allowance && allowance.remainingBudget >= amount;
}

async function sendPaymentWithAllowance(message: Message, keysend: boolean) {
  try {
    if (keysend) {
      const response = await sendPaymentKeySend(message);
      return response;
    } else {
      const response = await sendPayment(message);
      return response;
    }
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

async function payWithPrompt(message: Message, type: string) {
  try {
    const response = await utils.openPrompt({
      ...message,
      type: type,
    });
    return response;
  } catch (e) {
    console.log("Payment cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export {
  sendPaymentOrPrompt,
  payWithPrompt,
  checkAllowance,
  sendPaymentWithAllowance,
};
