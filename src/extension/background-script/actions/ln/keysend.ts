import PubSub from "pubsub-js";

import { Message } from "~/types";
import state from "../../state";
import utils from "~/common/lib/utils";

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
    response = { error: e instanceof Error ? e.message : "" };
  }
  utils.publishPaymentNotification(
    message,
    {
      tags: [],
    },
    response
  );
  return response;
}
