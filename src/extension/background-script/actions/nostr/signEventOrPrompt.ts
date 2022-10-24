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
    const response = await utils.openPrompt({
      ...message,
      action: "confirmSignMessage",
    });

    const signature = await state
      .getState()
      .getNostr()
      .signEvent(message.args.event);
    response.data = signature;

    return response;
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signEventOrPrompt;
