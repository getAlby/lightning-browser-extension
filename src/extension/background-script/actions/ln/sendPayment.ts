import lightningPayReq from "bolt11";
import PubSub from "pubsub-js";
import utils from "~/common/lib/utils";
import { Message } from "~/types";

import state from "../../state";

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
    let message;
    if (typeof e === "string") {
      message = e;
    } else if (e instanceof Error) {
      message = e.message;
    } else {
      message = "Something went wrong";
    }
    response = {
      error: message,
    };
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
