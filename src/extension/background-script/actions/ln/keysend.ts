import PubSub from "pubsub-js";
import pubsub from "~/common/lib/pubsub";
import { Message } from "~/types";

import state from "../../state";

export default async function keysend(message: Message) {
  PubSub.publish(`ln.keysend.start`, message);
  const { destination, amount, customRecords } = message.args;

  const accountId = await state.getState().currentAccountId;
  if (!accountId) {
    return {
      error: "Select an account.",
    };
  }

  if (
    typeof destination !== "string" ||
    (typeof amount !== "string" && typeof amount !== "number")
  ) {
    return {
      error: "Destination or amount missing.",
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
  pubsub.publishPaymentNotification("keysend", message, {
    accountId,
    response,
    details: {
      destination: destination,
    },
  });
  return response;
}
