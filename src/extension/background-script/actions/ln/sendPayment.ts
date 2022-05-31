import state from "../../state";
import lightningPayReq from "bolt11";
import PubSub from "pubsub-js";
import utils from "~/common/lib/utils";
import { Message } from "~/types";

export default async function sendPayment(message: Message) {
  PubSub.publish(`ln.sendPayment.start`, message);
  const { paymentRequest } = message.args;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }

  const paymentRequestDetails = lightningPayReq.decode(paymentRequest);
  const connector = await state.getState().getConnector();

  let response;
  try {
    response = await connector.sendPayment({
      paymentRequest,
    });
  } catch (e) {
    response = { error: e instanceof Error ? e.message : "" };
  }
  utils.publishPaymentNotification(message, {
    paymentRequestDetails,
    response,
    details: {
      description: paymentRequestDetails.tagsObject.description,
      destination: paymentRequestDetails.payeeNodeKey,
    },
  });
  return response;
}
