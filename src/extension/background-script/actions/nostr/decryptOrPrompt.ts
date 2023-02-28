import utils from "~/common/lib/utils";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import { MessageDecryptGet, PermissionMethodNostr } from "~/types";

import { addPermissionFor, hasPermissionFor } from "./helpers";

const decryptOrPrompt = async (message: MessageDecryptGet) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_NIP04DECRYPT"],
      message.origin.host
    );

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
          description: i18n.t("permissions:nostr.nip04decrypt"),
        },
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_NIP04DECRYPT"],
          message.origin.host
        );
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
