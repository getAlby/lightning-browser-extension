import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionFor,
  hasPermissionFor,
} from "~/extension/background-script/permissions";
import { MessageSignSchnorr, PermissionMethodNostr, Sender } from "~/types";

import state from "../../state";

const signSchnorrOrPrompt = async (
  message: MessageSignSchnorr,
  sender: Sender
) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const nostr = await state.getState().getNostr();
  const sigHash = message.args.sigHash;

  try {
    if (!sigHash || typeof sigHash !== "string") {
      throw new Error("sigHash is missing or not correct");
    }

    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_SIGNSCHNORR"],
      host
    );
    if (!hasPermission) {
      const promptResponse = await utils.openPrompt<{
        enabled: boolean;
        blocked: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmSignSchnorr",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.enabled) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_SIGNSCHNORR"],
          host,
          promptResponse.data.blocked
        );
      }
    }

    const signedSchnorr = await nostr.signSchnorr(sigHash);

    return { data: signedSchnorr };
  } catch (e) {
    console.error("signSchnorr cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signSchnorrOrPrompt;
