import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionFor,
  hasPermissionFor,
  isPermissionBlocked,
} from "~/extension/background-script/permissions";
import type { MessageNostrPublicKeyGetOrPrompt, Sender } from "~/types";
import { PermissionMethodNostr } from "~/types";

import {
  DONT_ASK_ANY,
  DONT_ASK_CURRENT,
  USER_REJECTED_ERROR,
} from "~/common/constants";
import state from "../../state";

const getPublicKeyOrPrompt = async (
  message: MessageNostrPublicKeyGetOrPrompt,
  sender: Sender
) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  try {
    const hasPermission = await hasPermissionFor(
      PermissionMethodNostr["NOSTR_GETPUBLICKEY"],
      host
    );

    const isBlocked = await isPermissionBlocked(
      PermissionMethodNostr["NOSTR_GETPUBLICKEY"],
      host
    );

    if (isBlocked) {
      return { denied: true };
    }

    if (hasPermission) {
      return getPublicKey();
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        permissionOption: string;
        blocked: boolean;
      }>({
        args: {},
        ...message,
        action: "public/nostr/confirmGetPublicKey",
      });
      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.permissionOption == DONT_ASK_CURRENT) {
        await addPermissionFor(
          PermissionMethodNostr["NOSTR_GETPUBLICKEY"],
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
        return getPublicKey();
      } else {
        return { error: USER_REJECTED_ERROR };
      }
    }
  } catch (e) {
    console.error("getPublicKey failed", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
  async function getPublicKey() {
    const publicKey = (await state.getState().getNostr()).getPublicKey();
    return { data: publicKey };
  }
};

export default getPublicKeyOrPrompt;
