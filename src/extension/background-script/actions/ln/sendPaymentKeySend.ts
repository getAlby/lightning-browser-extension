import PubSub from "pubsub-js";

import { Message } from "../../../../types";
import state from "../../state";

export default async function sendPaymentKeySend(message: Message) {
  PubSub.publish(`ln.sendPaymentKeySend.start`, message);
  const { pubkey, valueSat, comment } = message.args;
  if (typeof pubkey !== "string" || typeof valueSat !== "string") {
    return {
      error: "destination or amount missing.",
    };
  }

  const connector = await state.getState().getConnector();

  const response = await connector.sendPaymentKeySend({
    paymentRequest: "",
    offer: "",
    pubkey: pubkey,
    amount: parseInt(valueSat),
    memo: typeof comment == "string" ? comment : "",
  });
  return response;
}
