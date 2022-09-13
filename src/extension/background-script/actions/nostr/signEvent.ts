import * as nostrTools from "nostr-tools";
import { Message } from "~/types";

const signEvent = async (message: Message) => {
  // TODO: FIX TYPES
  if (!nostrTools.validateEvent(message.args.event as nostrTools.Event)) {
    console.error("Invalid event", message.args.event);
  }

  const event = await nostrTools.signEvent(
    message.args.event as nostrTools.Event,
    "" // TODO: add private key
  );

  return {
    data: {
      sig: event,
    },
  };
};

export default signEvent;
