import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionFor,
  hasPermissionFor,
  isPermissionBlocked,
} from "~/extension/background-script/permissions";
import { MessageSignEvent, PermissionMethodNostr, Sender } from "~/types";

import {
  DONT_ASK_ANY,
  DONT_ASK_CURRENT,
  USER_REJECTED_ERROR,
} from "~/common/constants";
import state from "../../state";
import { validateEvent } from "./helpers";
import { EventKind } from "~/extension/providers/nostr/types";

// Helper function to check if a kind 3 event has insufficient p-tags
function hasInsufficientPTags(event: any): boolean {
  if (event.kind !== EventKind.Contacts) return false;
  
  const pTags = event.tags?.filter((tag: string[]) => tag[0] === 'p') || [];
  return pTags.length < 2;
}

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

    // Always warn for kind 3 events with insufficient p-tags, even if permission exists
    const needsKind3Warning = hasInsufficientPTags(event);

    if (hasPermission && !needsKind3Warning) {
      return signEvent();
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        blocked: boolean;
        permissionOption: string;
      }>({
        ...message,
        action: "public/nostr/confirmSignMessage",
        args: {
          ...message.args,
          hasKind3Warning: needsKind3Warning,
        }
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
        Object.values(PermissionMethodNostr).forEach(async (permission) => {
          await addPermissionFor(permission, host, promptResponse.data.blocked);
        });
      }

      if (promptResponse.data.confirm) {
        return signEvent();
      } else {
        return { error: USER_REJECTED_ERROR };
      }
    }
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }

  async function signEvent() {
    if (!event.pubkey) event.pubkey = nostr.getPublicKey();
    if (!event.id) event.id = nostr.getEventHash(event);
    const signedEvent = await nostr.signEvent(event);

    return { data: signedEvent };
  }
};

export default signEventOrPrompt;
