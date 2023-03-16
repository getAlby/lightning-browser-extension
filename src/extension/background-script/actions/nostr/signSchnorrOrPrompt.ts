import utils from "~/common/lib/utils";
import { MessageSignSchnorr, PermissionMethodNostr } from "~/types";

import state from "../../state";
import { addPermissionFor, hasPermissionFor } from "../nostr/helpers";

const signSchnorrOrPrompt = async (message: MessageSignSchnorr) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  const nostr = state.getState().getNostr();
  const sigHash = message.args.sigHash;

  try {
    if (!sigHash || typeof sigHash !== "string") {
      throw new Error("sigHash is missing or not correct");
    }

    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_SIGNSCHNORR"],
      message.origin.host
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
          message.origin.host
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
