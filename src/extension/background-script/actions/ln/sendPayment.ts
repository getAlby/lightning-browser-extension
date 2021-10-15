import PubSub from "pubsub-js";
import { parsePaymentRequest } from "invoices";

import state from "../../state";
import utils from "../../../../common/lib/utils";

export default async function sendPayment(message) {
  PubSub.publish(`ln.sendPayment.start`, message);
  const { paymentRequest } = message.args;
  const paymentRequestDetails = parsePaymentRequest({
    request: paymentRequest,
  });
  const connector = state.getState().getConnector();

  const response = await connector.sendPayment({
    paymentRequest,
  });
  utils.publishPaymentNotification(message, paymentRequestDetails, response);
  return response;
}
