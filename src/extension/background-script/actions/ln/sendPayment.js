import PubSub from "pubsub-js";
import { parsePaymentRequest } from "invoices";
import utils from "../../../../common/lib/utils";
import state from "../../state";
import db from "../../db";

const sendPayment = async (message, sender) => {
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
    return sendPaymentWithPrompt(message, paymentRequestDetails);
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
  publishPaymentNotification(message, paymentRequestDetails, response);

  return response;
}

async function sendPaymentWithPrompt(message, paymentRequestDetails) {
  const connector = state.getState().getConnector();

  const response = await utils.openPrompt(message);
  if (response.data.confirmed) {
    const response = await connector.sendPayment({
      paymentRequest: message.args.paymentRequest,
    });

    publishPaymentNotification(message, paymentRequestDetails, response);
    return response;
  } else {
    return response;
  }
}

export function publishPaymentNotification(
  message,
  paymentRequestDetails,
  response
) {
  let status = "success"; // default. let's hope for success
  if (response.error || (response.data && response.data.payment_error)) {
    status = "failed";
  }
  PubSub.publish(`ln.sendPayment.${status}`, {
    response,
    paymentRequestDetails,
    origin: message.origin,
  });
}

export default sendPayment;
