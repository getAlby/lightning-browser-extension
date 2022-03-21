import PubSub from "pubsub-js";
import { parsePaymentRequest } from "invoices";

import { Message } from "../../../../types";
import state from "../../state";
import utils from "../../../../common/lib/utils";

export default async function sendPayment(message: Message) {
  PubSub.publish(`ln.sendPayment.start`, message);
  const { paymentRequest } = message.args;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }

  const paymentRequestDetails = parsePaymentRequest({
    request: paymentRequest,
  });
  const connector = await state.getState().getConnector();

  const response = await connector.sendPayment({
    paymentRequest,
  });
  utils.publishPaymentNotification(message, paymentRequestDetails, response);
  return response;
}
