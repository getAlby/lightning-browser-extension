import { parsePaymentRequest } from "invoices";
import utils from "../../../../common/lib/utils";
import db from "../../db";
import sendPayment from "../ln/sendPayment";

const sendPaymentOrPrompt = async (message, sender) => {
  const paymentRequest = message.args.paymentRequest;
  const paymentRequestDetails = parsePaymentRequest({
    request: paymentRequest,
  });

  const host = message.origin.host;
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (
    allowance &&
    allowance.remainingBudget >= parseInt(paymentRequestDetails.tokens)
  ) {
    return sendPaymentWithAllowance(message);
  } else {
    return payWithPrompt(message);
  }
};

async function sendPaymentWithAllowance(message) {
  try {
    const response = await sendPayment(message);
    return response;
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
}

async function payWithPrompt(message) {
  try {
    const response = await utils.openPrompt({
      ...message,
      type: "confirmPayment",
    });
    return response;
  } catch (e) {
    console.log("Payment cancelled", e);
    return { error: e.message };
  }
}

export default sendPaymentOrPrompt;
