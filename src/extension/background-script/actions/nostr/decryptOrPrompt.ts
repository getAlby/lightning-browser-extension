import { USER_REJECTED_ERROR } from "~/common/constants";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionFor,
  hasPermissionFor,
} from "~/extension/background-script/permissions";
import state from "~/extension/background-script/state";
import { MessageDecryptGet, PermissionMethodNostr, Sender } from "~/types";

const decryptOrPrompt = async (message: MessageDecryptGet, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_NIP04DECRYPT"],
      host
    );

    if (hasPermission) {
      const nostr = await state.getState().getNostr();
      const response = await nostr.nip04Decrypt(
        message.args.peer,
        message.args.ciphertext
      );

      return { data: response };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmDecrypt",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_NIP04DECRYPT"],
          host
        );
      }
      if (promptResponse.data.confirm) {
        const nostr = await state.getState().getNostr();
        const response = await nostr.nip04Decrypt(
          message.args.peer,
          message.args.ciphertext
        );

        return { data: response };
      } else {
        return { error: USER_REJECTED_ERROR };
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
