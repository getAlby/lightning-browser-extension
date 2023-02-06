import utils from "~/common/lib/utils";
import type { MessagePublicKeyGet } from "~/types";
import { PermissionMethodLiquid } from "~/types";

import state from "../../state";
import { addPermissionFor, hasPermissionFor } from "../nostr/helpers";

const getPublicKeyOrPrompt = async (message: MessagePublicKeyGet) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodLiquid["LIQUID_GETPUBLICKEY"],
      message.origin.host
    );

    if (hasPermission) {
      const publicKey = state.getState().getLiquid().getPublicKey();
      return { data: publicKey };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
      }>({
        args: {},
        ...message,
        action: "public/liquid/confirmGetPublicKey",
      });
      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodLiquid["LIQUID_GETPUBLICKEY"],
          message.origin.host
        );
      }

      if (promptResponse.data.confirm) {
        // Normally `openPrompt` would throw already, but to make sure we got a confirm from the user we check this here
        const publicKey = state.getState().getLiquid().getPublicKey();
        return { data: publicKey };
      } else {
        return { error: "User rejected" };
      }
    }
  } catch (e) {
    console.error("getPublicKey failed", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default getPublicKeyOrPrompt;
