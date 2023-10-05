import PubSub from "pubsub-js";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import type {
  LNURLDetails,
  LnurlAuthResponse,
  MessageWebLnLnurl,
  Sender,
} from "~/types";

import { authFunction } from "./auth";

async function authOrPrompt(
  message: MessageWebLnLnurl,
  sender: Sender,
  lnurlDetails: LNURLDetails
) {
  const host = getHostFromSender(sender);
  if (!host) return;

  if (!("host" in message.origin)) return;

  PubSub.publish(`lnurl.auth.start`, { message, lnurlDetails });

  // get the publisher to check if lnurlAuth for auto-login is enabled
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  // we have the check the unlock status manually. The account can still be locked
  // If it is locked we must show a prompt to unlock
  const isUnlocked = await state.getState().isUnlocked();
  const account = await state.getState().getAccount();

  async function authPrompt() {
    try {
      const promptMessage = {
        ...message,
        action: "lnurlAuth",
        args: {
          ...message.args,
          lnurlDetails,
        },
      };

      const response = await utils.openPrompt<LnurlAuthResponse>(promptMessage);
      return response;
    } catch (e) {
      // user rejected
      return { error: e instanceof Error ? e.message : e };
    }
  }

  // check if there is a publisher and lnurlAuth is enabled,
  // otherwise we we prompt the user

  if (
    isUnlocked &&
    allowance &&
    allowance.enabled &&
    allowance.lnurlAuth &&
    (!account?.useMnemonicForLnurlAuth || account?.mnemonic)
  ) {
    return await authFunction({ lnurlDetails, origin: message.origin });
  }

  return await authPrompt();
}

export default authOrPrompt;
