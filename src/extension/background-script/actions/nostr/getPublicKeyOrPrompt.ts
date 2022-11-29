import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import type { MessagePublicKeyGet } from "~/types";
import { PermissionMethodNostr } from "~/types";

import state from "../../state";

const getPublicKeyOrPrompt = async (message: MessagePublicKeyGet) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  const allowance = await db.allowances.get({
    host: message.origin.host,
  });

  if (!allowance?.id) {
    return { error: "Could not find an allowance for this host" };
  }

  const findPermission = await db.permissions.get({
    host: message.origin.host,
    method: PermissionMethodNostr["NOSTR_GETPUBLICKEY"],
  });

  const hasPermission = !!findPermission?.enabled;

  try {
    if (hasPermission) {
      const publicKey = state.getState().getNostr().getPublicKey();
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
        const permissionIsAdded = await db.permissions.add({
          createdAt: Date.now().toString(),
          allowanceId: allowance.id,
          host: message.origin.host,
          method: PermissionMethodNostr["NOSTR_GETPUBLICKEY"],
          enabled: true,
          blocked: false,
        });

        !!permissionIsAdded && (await db.saveToStorage());
      }

      if (promptResponse.data.confirm) {
        // Normally `openPrompt` would throw already, but to make sure we got a confirm from the user we check this here
        const publicKey = state.getState().getNostr().getPublicKey();
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
