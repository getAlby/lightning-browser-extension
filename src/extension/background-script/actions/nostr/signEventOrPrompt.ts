import { decryptData } from "~/common/lib/crypto";
import utils from "~/common/lib/utils";
import { Event } from "~/extension/ln/nostr/types";
import { Message } from "~/types";

import state from "../../state";
import { signEvent, validateEvent } from "./helpers";

const signEventOrPrompt = async (message: Message) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  if (!validateEvent(message.args.event as Event)) {
    console.error("Invalid event");
    return {
      error: "Invalid event.",
    };
  }

  // Can we create a more generic version of such a prompt?
  // Set the message as the user needs to see the event details
  message.args.message = JSON.stringify(message.args.event);

  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmSignMessage",
    });

    const pw = state.getState().password;
    const pk = state.getState().nostrPrivateKey;

    if (!pw || !pk) {
      return;
    }

    const decryptedPrivateKey = decryptData(pk, pw);

    const event = await signEvent(
      message.args.event as Event,
      decryptedPrivateKey
    );

    response.data = event;
    return response;
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signEventOrPrompt;
