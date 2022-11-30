import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import { MessageDecryptGet, PermissionMethodNostr } from "~/types";

const decryptOrPrompt = async (message: MessageDecryptGet) => {
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
    method: PermissionMethodNostr["NOSTR_NIP04DECRYPT"],
  });

  const hasPermission = !!findPermission?.enabled;

  try {
    if (hasPermission) {
      const response = state
        .getState()
        .getNostr()
        .decrypt(message.args.peer, message.args.ciphertext);

      return { data: response };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
      }>({
        ...message,
        action: "public/nostr/confirm",
        args: {
          description: i18n.t("nostr.permissions.decrypt"),
        },
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        const permissionIsAdded = await db.permissions.add({
          createdAt: Date.now().toString(),
          allowanceId: allowance.id,
          host: message.origin.host,
          method: PermissionMethodNostr["NOSTR_NIP04DECRYPT"],
          enabled: true,
          blocked: false,
        });

        !!permissionIsAdded && (await db.saveToStorage());
      }
      if (promptResponse.data.confirm) {
        const response = state
          .getState()
          .getNostr()
          .decrypt(message.args.peer, message.args.ciphertext);

        return { data: response };
      } else {
        return { error: "User rejected" };
      }
    }
  } catch (e) {
    console.error("decrypt failed", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default decryptOrPrompt;
