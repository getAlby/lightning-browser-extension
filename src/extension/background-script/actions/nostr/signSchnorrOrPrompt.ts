import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import {
  addPermissionFor,
  hasPermissionFor,
  isPermissionBlocked,
} from "~/extension/background-script/permissions";
import { MessageSignSchnorr, PermissionMethodNostr, Sender } from "~/types";

import {
  DONT_ASK_ANY,
  DONT_ASK_CURRENT,
  USER_REJECTED_ERROR,
} from "~/common/constants";
import state from "../../state";

const signSchnorrOrPrompt = async (
  message: MessageSignSchnorr,
  sender: Sender
) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const nostr = await state.getState().getNostr();
  const sigHash = message.args.sigHash;
  const plaintext = message.args.message;

  const isMessageMode = message.args.message !== undefined;

  try {
    if (isMessageMode) {
      if (typeof plaintext !== "string") {
        throw new Error("message is missing or not correct");
      }
    } else if (!sigHash || typeof sigHash !== "string") {
      throw new Error("sigHash is missing or not correct");
    }

    const permissionMethod = PermissionMethodNostr["NOSTR_SIGNSCHNORR"];

    const hasPermission = await hasPermissionFor(permissionMethod, host);

    const isBlocked = await isPermissionBlocked(permissionMethod, host);

    if (isBlocked) {
      return { denied: true };
    }

    if (hasPermission) {
      return signSchnorr();
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        blocked: boolean;
        permissionOption: string;
      }>({
        ...message,
        action: "public/nostr/confirmSignSchnorr",
      });

      if (promptResponse.data.permissionOption == DONT_ASK_CURRENT) {
        await addPermissionFor(
          permissionMethod,
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
        return signSchnorr();
      } else {
        return { error: USER_REJECTED_ERROR };
      }
    }
  } catch (e) {
    console.error("signSchnorr cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }

  async function signSchnorr() {
    let signedSchnorr: string;

    if (isMessageMode) {
      signedSchnorr = await nostr.hashAndSignSchnorr(plaintext as string);
    } else {
      signedSchnorr = await nostr.signSchnorr(sigHash as string);
    }

    return { data: signedSchnorr };
  }
};

export default signSchnorrOrPrompt;
