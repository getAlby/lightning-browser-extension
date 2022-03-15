import PubSub from "pubsub-js";

import { Message } from "../../../../types";
import state from "../../state";
import utils from "../../../../common/lib/utils";

export default async function sendPaymentKeySend(message: Message) {
  PubSub.publish(`ln.sendPaymentKeySend.start`, message);
  const { destination, amount, comment } = message.args;
  if (typeof destination !== "string" || typeof amount !== "string") {
    return {
      error: "destination or amount missing.",
    };
  }

  const connector = await state.getState().getConnector();

  const response = await connector.sendPaymentKeySend({
    paymentRequest: "",
    offer: "",
    pubkey: destination,
    amount: parseInt(amount),
    memo: typeof comment == "string" ? comment : "",
  });
  utils.publishPaymentNotification(
    message,
    {
      cltv_delta: 0,
      created_at: "",
      description: comment as string,
      destination: destination,
      expires_at: "",
      features: [],
      id: "",
      is_expired: false,
      mtokens: "",
      network: "",
      safe_tokens: 0,
      tokens: 0,
    },
    response
  );
  return response;
}
