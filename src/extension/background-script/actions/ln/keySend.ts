import PubSub from "pubsub-js";

import { Message } from "../../../../types";
import state from "../../state";
import utils from "../../../../common/lib/utils";

export default async function keySend(message: Message) {
  PubSub.publish(`ln.keySend.start`, message);
  const { destination, amount, customRecords } = message.args;
  if (typeof destination !== "string" || typeof amount !== "string") {
    return {
      error: "destination or amount missing.",
    };
  }

  const connector = await state.getState().getConnector();

  const response = await connector.keySend({
    pubkey: destination,
    amount: parseInt(amount),
    customRecords: customRecords as Record<string, string>,
  });
  utils.publishPaymentNotification(
    message,
    {
      cltv_delta: 0,
      created_at: "",
      //what to do with the description here?
      description: "",
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
