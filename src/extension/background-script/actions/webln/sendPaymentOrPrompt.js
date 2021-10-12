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
    return sendPaymentWithAllowance(message, paymentRequestDetails, allowance);
  } else {
    return payWithPrompt(message, paymentRequestDetails);
  }
};

async function sendPaymentWithAllowance(message, paymentRequestDetails) {
  const response = sendPayment(message);
  utils.publishPaymentNotification(message, paymentRequestDetails, response);
  return response;
}

async function payWithPrompt(message, paymentRequestDetails) {
  try {
    const response = await utils.openPrompt({
      ...message,
      type: "confirmPayment",
    });
    utils.publishPaymentNotification(message, paymentRequestDetails, response);
    return response;
  } catch (e) {
    console.log("Payment cancelled", e);
    return { error: e.message };
  }
}

export default sendPaymentOrPrompt;
