import { USER_REJECTED_ERROR } from "~/common/constants";
import nostr from "~/common/lib/nostr";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionForNostrPrompt,
  hasPermissionFor,
  isPermissionBlocked,
} from "~/extension/background-script/permissions";
import state from "~/extension/background-script/state";
import { MessageNip44EncryptGet, PermissionMethodNostr, Sender } from "~/types";

const nip44EncryptOrPrompt = async (
  message: MessageNip44EncryptGet,
  sender: Sender
) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_ENCRYPT"],
      host
    );

    const isBlocked = await isPermissionBlocked(
      PermissionMethodNostr["NOSTR_ENCRYPT"],
      host
    );

    if (isBlocked) {
      return { denied: true };
    }

    if (hasPermission) {
      return nip44Encrypt();
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        permissionOption: string;
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
      await addPermissionForNostrPrompt(
        host,
        PermissionMethodNostr["NOSTR_ENCRYPT"],
        promptResponse.data.permissionOption,
        promptResponse.data.blocked
      );

      if (promptResponse.data.confirm) {
        return nip44Encrypt();
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

  async function nip44Encrypt() {
    const response = (await state.getState().getNostr()).nip44Encrypt(
      message.args.peer,
      message.args.plaintext
    );

    return { data: response };
  }
};

export default nip44EncryptOrPrompt;
