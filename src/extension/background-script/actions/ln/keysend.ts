import PubSub from "pubsub-js";
import pubsub from "~/common/lib/pubsub";
import { Message } from "~/types";
import { AlbyEventType } from "~/types";

import state from "../../state";

export default async function keysend(message: Message) {
  PubSub.publish(`ln.keysend.start`, message);
  const { destination, amount, customRecords } = message.args;
  if (
    typeof destination !== "string" ||
    (typeof amount !== "string" && typeof amount !== "number")
  ) {
    return {
      error: "destination or amount missing.",
    };
  }

  const connector = await state.getState().getConnector();

  let response;
  try {
    response = await connector.keysend({
      pubkey: destination,
      amount: parseInt(amount as string),
      customRecords: customRecords as Record<string, string>,
    });
  } catch (e) {
    response = {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }
  pubsub.publishPaymentNotification(message, {
    response,
    details: {
      destination: destination,
    },
    event: AlbyEventType.TRANSACTION,
  });
  return response;
}
