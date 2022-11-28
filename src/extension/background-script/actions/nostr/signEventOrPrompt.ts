import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { MessageSignEvent } from "~/types";
import { PermissionMethod } from "~/types";

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

  const hasPermission = await db.permissions
    .where("host")
    .equalsIgnoreCase(message.origin.host)
    .and(
      (permission) =>
        permission.enabled &&
        permission.method === PermissionMethod["NOSTR_SIGNMESSAGE"]
    )
    .first();

  try {
    if (!hasPermission) {
      const response = await utils.openPrompt<{
        confirm: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmSignMessage",
      });

      if (!response.data.confirm) {
        throw new Error("User rejected");
      }
    }

    const signedEvent = await state
      .getState()
      .getNostr()
      .signEvent(message.args.event);

    return { data: signedEvent };
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signEventOrPrompt;
