import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionFor,
  hasPermissionFor,
  isPermissionBlocked,
} from "~/extension/background-script/permissions";
import { MessageSignEvent, PermissionMethodNostr, Sender } from "~/types";

import { DONT_ASK_ANY, DONT_ASK_CURRENT } from "~/common/constants";
import state from "../../state";
import { validateEvent } from "./helpers";

const signEventOrPrompt = async (message: MessageSignEvent, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const nostr = await state.getState().getNostr();
  // check event and add an ID and pubkey if not present
  const event = message.args.event;

  try {
    if (!validateEvent(event)) {
      console.error("Invalid event");
      return {
        error: "Invalid event.",
      };
    }

    const hasPermission =
      (await hasPermissionFor(
        PermissionMethodNostr["NOSTR_SIGNMESSAGE"],
        host
      )) ||
      (await hasPermissionFor(
        PermissionMethodNostr["NOSTR_SIGNMESSAGE"] + "/" + event.kind,
        host
      ));

    const isBlocked =
      (await isPermissionBlocked(
        PermissionMethodNostr["NOSTR_SIGNMESSAGE"],
        host
      )) ||
      (await isPermissionBlocked(
        PermissionMethodNostr["NOSTR_SIGNMESSAGE"] + "/" + event.kind,
        host
      ));

    if (isBlocked) {
      return { denied: true };
    }

    if (!hasPermission) {
      const promptResponse = await utils.openPrompt<{
        blocked: boolean;
        permissionOption: string;
      }>({
        ...message,
        action: "public/nostr/confirmSignMessage",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.permissionOption == DONT_ASK_CURRENT) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_SIGNMESSAGE"] + "/" + event.kind,
          host,
          promptResponse.data.blocked
        );
      }

      if (promptResponse.data.permissionOption == DONT_ASK_ANY) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_SIGNMESSAGE"],
          host,
          promptResponse.data.blocked
        );
      }
    }

    if (!event.pubkey) event.pubkey = nostr.getPublicKey();
    if (!event.id) event.id = nostr.getEventHash(event);
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
