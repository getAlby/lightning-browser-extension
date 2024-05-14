import lightningPayReq from "bolt11-signet";
import PubSub from "pubsub-js";
import pubsub from "~/common/lib/pubsub";
import state from "~/extension/background-script/state";
import { Message, MessageSendPayment } from "~/types";

export default async function sendPayment(
  message: MessageSendPayment | Message // 'keysend' & 'sendPaymentOrPrompt' still need the Message type
) {
  PubSub.publish(`ln.sendPayment.start`, message);

  const accountId = await state.getState().currentAccountId;
  if (!accountId) {
    return {
      error: "Select an account.",
    };
  }

  const { paymentRequest } = message.args;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }

  const connector = await state.getState().getConnector();

  let response, paymentRequestDetails;

  try {
    paymentRequestDetails = lightningPayReq.decode(paymentRequest);

    response = await connector.sendPayment({
      paymentRequest,
    });
  } catch (e) {
    let errorMessage;

    if (typeof e === "string") {
      errorMessage = e;
    } else if ((e as Error).message) {
      errorMessage = (e as Error).message;
    } else {
      errorMessage = "Something went wrong";
    }

    response = {
      error: errorMessage,
    };
  }

  pubsub.publishPaymentNotification("sendPayment", message, {
    accountId,
    paymentRequestDetails,
    response,
    details: {
      ...(paymentRequestDetails && {
        description: paymentRequestDetails.tagsObject.description,
        destination: paymentRequestDetails.payeeNodeKey,
      }),
    },
  });

  return response;
}
