import utils from "~/common/lib/utils";
import { MessageSignSchnorr, PermissionMethodLiquid } from "~/types";

import state from "../../state";
import { addPermissionFor, hasPermissionFor } from "../nostr/helpers";

const signSchnorrOrPrompt = async (message: MessageSignSchnorr) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  const liquid = state.getState().getLiquid();
  const sigHash = message.args.sigHash;

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodLiquid["LIQUID_SIGNSCHNORR"],
      message.origin.host
    );
    if (!hasPermission) {
      const promptResponse = await utils.openPrompt<{
        enabled: boolean;
        blocked: boolean;
      }>({
        ...message,
        action: "public/liquid/confirmSignSchnorr",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.enabled) {
        await addPermissionFor(
          PermissionMethodLiquid["LIQUID_SIGNSCHNORR"],
          message.origin.host
        );
      }
    }

    const signedSchnorr = await liquid.signSchnorr(sigHash);

    return { data: signedSchnorr };
  } catch (e) {
    console.error("signSchnorr cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signSchnorrOrPrompt;
