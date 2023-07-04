import utils from "~/common/lib/utils";
import type { MessageNostrPublicKeyGetOrPrompt } from "~/types";
import { PermissionMethodNostr } from "~/types";

import state from "../../state";
import { addPermissionFor, hasPermissionFor } from "./helpers";

const getPublicKeyOrPrompt = async (
  message: MessageNostrPublicKeyGetOrPrompt
) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_GETPUBLICKEY"],
      message.origin.host
    );

    if (hasPermission) {
      const publicKey = (await state.getState().getNostr()).getPublicKey();
      return { data: publicKey };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
      }>({
        args: {},
        ...message,
        action: "public/nostr/confirmGetPublicKey",
      });
      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_GETPUBLICKEY"],
          message.origin.host
        );
      }

      if (promptResponse.data.confirm) {
        // Normally `openPrompt` would throw already, but to make sure we got a confirm from the user we check this here
        const publicKey = (await state.getState().getNostr()).getPublicKey();
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
