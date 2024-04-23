import { USER_REJECTED_ERROR } from "~/common/constants";
import nostr from "~/common/lib/nostr";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionFor,
  hasPermissionFor,
} from "~/extension/background-script/permissions";
import state from "~/extension/background-script/state";
import { MessageEncryptGet, PermissionMethodNostr, Sender } from "~/types";

const encryptOrPrompt = async (message: MessageEncryptGet, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_NIP04ENCRYPT"],
      host
    );

    if (hasPermission) {
      const nostr = await state.getState().getNostr();
      const response = await nostr.nip04Encrypt(
        message.args.peer,
        message.args.plaintext
      );
      return { data: response };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
        blocked: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmEncrypt",
        args: {
          encrypt: {
            recipientNpub: nostr.hexToNip19(message.args.peer, "npub"),
            message: message.args.plaintext,
          },
        },
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_NIP04ENCRYPT"],
          host,
          promptResponse.data.blocked
        );
      }
      if (promptResponse.data.confirm) {
        const nostr = await state.getState().getNostr();
        const response = await nostr.nip04Encrypt(
          message.args.peer,
          message.args.plaintext
        );

        return { data: response };
      } else {
        return { error: USER_REJECTED_ERROR };
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
