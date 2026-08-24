import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { isEventSerialization } from "~/common/utils/nostrSigning";
import { isPermissionBlocked } from "~/extension/background-script/permissions";
import { MessageSignSchnorr, PermissionMethodNostr, Sender } from "~/types";

import { USER_REJECTED_ERROR } from "~/common/constants";
import state from "../../state";

const signSchnorrOrPrompt = async (
  message: MessageSignSchnorr,
  sender: Sender
) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const nostr = await state.getState().getNostr();
  const plaintext = message.args.message;

  try {
    if (typeof plaintext !== "string" || !plaintext) {
      throw new Error("message is missing or not correct");
    }

    // The digest of a NIP-01 serialization is the event id, so signing one
    // produces a valid event signature. Those requests go through signEvent,
    // which shows the kind and asks for the matching permission.
    if (isEventSerialization(plaintext)) {
      throw new Error(
        "nostr events must be signed with signEvent, not hashAndSignSchnorr"
      );
    }

    const permissionMethod = PermissionMethodNostr["NOSTR_SIGNSCHNORR"];

    if (await isPermissionBlocked(permissionMethod, host)) {
      return { denied: true };
    }

    // Always ask. What is signed here is opaque to the extension and a
    // signature is reusable, so there is no grant that safely covers the next
    // request.
    const promptResponse = await utils.openPrompt<{
      confirm: boolean;
      blocked: boolean;
    }>({
      ...message,
      action: "public/nostr/confirmSignSchnorr",
    });

    if (!promptResponse.data.confirm) {
      return { error: USER_REJECTED_ERROR };
    }

    return { data: await nostr.hashAndSignSchnorr(plaintext) };
  } catch (e) {
    console.error("signSchnorr cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signSchnorrOrPrompt;
