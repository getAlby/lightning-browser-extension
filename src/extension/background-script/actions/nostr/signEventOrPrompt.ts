import utils from "~/common/lib/utils";
import { MessageSignEvent } from "~/types";

import state from "../../state";
import { validateEvent } from "./helpers";

const signEventOrPrompt = async (message: MessageSignEvent) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  if (!validateEvent(message.args.event)) {
    console.error("Invalid event");
    return {
      error: "Invalid event.",
    };
  }

  // Set the message as the user needs to see the event details
  message.args.message = JSON.stringify(message.args.event);

  try {
    const response = await utils.openPrompt<{
      confirm: boolean;
    }>({
      ...message,
      action: "public/nostr/confirmSignMessage",
    });
    if (!response.data.confirm) {
      throw new Error("User rejected");
    }

    const event = message.args.event;

    const signedEvent = await state.getState().getNostr().signEvent(event);

    return { data: signedEvent };
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signEventOrPrompt;
