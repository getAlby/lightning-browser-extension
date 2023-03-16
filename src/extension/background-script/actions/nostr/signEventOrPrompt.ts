import utils from "~/common/lib/utils";
import { MessageSignEvent } from "~/types";
import { PermissionMethodNostr } from "~/types";

import state from "../../state";
import { hasPermissionFor, addPermissionFor } from "./helpers";
import { validateEvent } from "./helpers";

const signEventOrPrompt = async (message: MessageSignEvent) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  const nostr = state.getState().getNostr();

  // check event and add an ID and pubkey if not present
  const event = message.args.event;
  if (!event.pubkey) event.pubkey = nostr.getPublicKey();
  if (!event.id) event.id = nostr.getEventHash(event);

  if (!validateEvent(event)) {
    console.error("Invalid event");
    return {
      error: "Invalid event.",
    };
  }

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_SIGNMESSAGE"],
      message.origin.host
    );
    if (!hasPermission) {
      const promptResponse = await utils.openPrompt<{
        enabled: boolean;
        blocked: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmSignMessage",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.enabled) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_SIGNMESSAGE"],
          message.origin.host
        );
      }
    }

    const signedEvent = await nostr.signEvent(event);

    return { data: signedEvent };
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signEventOrPrompt;
