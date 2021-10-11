import PubSub from "pubsub-js";
import { parsePaymentRequest } from "invoices";
import utils from "../../../../common/lib/utils";
import state from "../../state";
import db from "../../db";

const sendPaymentOrPrompt = async (message, sender) => {
  PubSub.publish(`ln.sendPayment.start`, message);

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

async function sendPaymentWithAllowance(
  message,
  paymentRequestDetails,
  allowance
) {
  const connector = state.getState().getConnector();
  const response = await connector.sendPayment({
    paymentRequest: message.args.paymentRequest,
  });
  utils.publishPaymentNotification(message, paymentRequestDetails, response);

  return response;
}

async function payWithPrompt(message, paymentRequestDetails) {
  try {
    const response = await utils.openPrompt({
      ...message,
      type: "sendPayment",
    });
    utils.publishPaymentNotification(message, paymentRequestDetails, response);
    return response;
  } catch (e) {
    console.log("Payment cancelled", e);
    return { error: e.message };
  }
}

export default sendPaymentOrPrompt;
