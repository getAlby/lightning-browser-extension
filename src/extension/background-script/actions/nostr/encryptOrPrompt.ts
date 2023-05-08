import utils from "~/common/lib/utils";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import { MessageEncryptGet, PermissionMethodNostr } from "~/types";

import { addPermissionFor, hasPermissionFor } from "./helpers";

const encryptOrPrompt = async (message: MessageEncryptGet) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_NIP04ENCRYPT"],
      message.origin.host
    );

    if (hasPermission) {
      const response = (await state.getState().getNostr()).encrypt(
        message.args.peer,
        message.args.plaintext
      );

      return { data: response };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
      }>({
        ...message,
        action: "public/nostr/confirm",
        args: {
          description: i18n.t("permissions:nostr.nip04encrypt"),
        },
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_NIP04ENCRYPT"],
          message.origin.host
        );
      }
      if (promptResponse.data.confirm) {
        const response = (await state.getState().getNostr()).encrypt(
          message.args.peer,
          message.args.plaintext
        );

        return { data: response };
      } else {
        return { error: "User rejected" };
      }
    }
  } catch (e) {
    console.error("encrypt failed", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default encryptOrPrompt;
