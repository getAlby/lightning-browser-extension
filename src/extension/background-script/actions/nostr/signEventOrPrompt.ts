import * as nostrTools from "nostr-tools";
import utils from "~/common/lib/utils";
import { Message } from "~/types";

import state from "../../state";

const signEventOrPrompt = async (message: Message) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  // TODO: FIX TYPES
  if (!nostrTools.validateEvent(message.args.event as nostrTools.Event)) {
    console.error("Invalid event");
    return {
      error: "Invalid event.",
    };
  }

  return signWithPrompt(message);
};

async function signWithPrompt(message: Message) {
  // Can we create a more generic version of such a prompt?
  // Set the message as the user needs to see the event details
  message.args.message = JSON.stringify(message.args.event);

  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmSignMessage",
    });

    const event = await nostrTools.signEvent(
      message.args.event as nostrTools.Event,
      state.getState().settings.nostrPrivateKey
    );

    response.data = event;
    return response;
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export default signEventOrPrompt;
