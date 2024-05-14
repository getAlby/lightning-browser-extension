import {
  DONT_ASK_ANY,
  DONT_ASK_CURRENT,
  USER_REJECTED_ERROR,
} from "~/common/constants";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionFor,
  hasPermissionFor,
  isPermissionBlocked,
} from "~/extension/background-script/permissions";
import state from "~/extension/background-script/state";
import { MessageNip44DecryptGet, PermissionMethodNostr, Sender } from "~/types";

const nip44DecryptOrPrompt = async (
  message: MessageNip44DecryptGet,
  sender: Sender
) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_DECRYPT"],
      host
    );

    const isBlocked = await isPermissionBlocked(
      PermissionMethodNostr["NOSTR_DECRYPT"],
      host
    );

    if (isBlocked) {
      return { denied: true };
    }

    if (hasPermission) {
      return nip44Decrypt();
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        permissionOption: string;
        blocked: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmDecrypt",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.permissionOption == DONT_ASK_CURRENT) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_DECRYPT"],
          host,
          promptResponse.data.blocked
        );
      }

      if (promptResponse.data.permissionOption == DONT_ASK_ANY) {
        Object.values(PermissionMethodNostr).forEach(async (permission) => {
          await addPermissionFor(permission, host, promptResponse.data.blocked);
        });
      }

      if (promptResponse.data.confirm) {
        return nip44Decrypt();
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

  async function nip44Decrypt() {
    const nostr = await state.getState().getNostr();
    const response = await nostr.nip44Decrypt(
      message.args.peer,
      message.args.ciphertext
    );

    return { data: response };
  }
};

export default nip44DecryptOrPrompt;
