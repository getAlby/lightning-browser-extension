import * as nostrTools from "nostr-tools";
import { Message } from "~/types";

const privateKey =
  "0a334764af75be0347e2699f4db94c2c4b557f79aa69b01ec6080224f2af100d";

const signEvent = async (message: Message) => {
  // TODO: FIX TYPES
  if (!nostrTools.validateEvent(message.args.event as nostrTools.Event)) {
    console.error("Invalid event", message.args.event);
  }

  const event = await nostrTools.signEvent(
    message.args.event as nostrTools.Event,
    privateKey
  );

  return {
    data: {
      sig: event,
    },
  };
};

export default signEvent;
