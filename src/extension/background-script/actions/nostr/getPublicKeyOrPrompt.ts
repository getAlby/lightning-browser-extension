import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionForNostrPrompt,
  hasPermissionFor,
  isPermissionBlocked,
} from "~/extension/background-script/permissions";
import type { MessageNostrPublicKeyGetOrPrompt, Sender } from "~/types";
import { PermissionMethodNostr } from "~/types";

import { USER_REJECTED_ERROR } from "~/common/constants";
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
      await addPermissionForNostrPrompt(
        host,
        PermissionMethodNostr["NOSTR_GETPUBLICKEY"],
        promptResponse.data.permissionOption,
        promptResponse.data.blocked
      );

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
