import lightningPayReq from "bolt11";
import PubSub from "pubsub-js";
import pubsub from "~/common/lib/pubsub";
import state from "~/extension/background-script/state";
import { MessageSendPayment, Message } from "~/types";
import { AlbyEventType } from "~/types";

export default async function sendPayment(
  message: MessageSendPayment | Message // 'keysend' & 'sendPaymentOrPrompt' still need the Message type
) {
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
    let errorMessage;

    if (typeof e === "string") {
      errorMessage = e;
    } else if (e instanceof Error) {
      errorMessage = e.message;
    } else {
      errorMessage = "Something went wrong";
    }

    response = {
      error: errorMessage,
    };
  }

  pubsub.publishPaymentNotification(message, {
    paymentRequestDetails,
    response,
    details: {
      description: paymentRequestDetails.tagsObject.description,
      destination: paymentRequestDetails.payeeNodeKey,
    },
    event: AlbyEventType.TRANSACTION,
  });

  return response;
}
