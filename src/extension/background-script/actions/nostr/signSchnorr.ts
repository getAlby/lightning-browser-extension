import { USER_REJECTED_ERROR } from "~/common/constants";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import db from "~/extension/background-script/db";
import { MessageSignSchnorr, Sender } from "~/types";

import state from "../../state";

const signSchnorr = async (message: MessageSignSchnorr, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const nostr = await state.getState().getNostr();
  const sigHash = message.args.sigHash;
  const plaintext = message.args.message;

  const isMessageMode = message.args.message !== undefined;

  try {
    const allowance = await db.allowances
      .where("host")
      .equalsIgnoreCase(host)
      .first();

    if (!allowance?.id) {
      throw new Error("Could not find an allowance for this host");
    }

    if (isMessageMode) {
      if (typeof plaintext !== "string") {
        throw new Error("message is missing or not correct");
      }
    } else if (!sigHash || typeof sigHash !== "string") {
      throw new Error("sigHash is missing or not correct");
    }

    const promptResponse = await utils.openPrompt<{
      confirm: boolean;
    }>({
      ...message,
      action: "public/nostr/confirmSignSchnorr",
    });

    if (promptResponse.data.confirm) {
      let signedSchnorr: string;

      if (isMessageMode) {
        signedSchnorr = await nostr.hashAndSignSchnorr(plaintext as string);
      } else {
        signedSchnorr = await nostr.signSchnorr(sigHash as string);
      }

      return { data: signedSchnorr };
    } else {
      return { error: USER_REJECTED_ERROR };
    }
  } catch (e) {
    console.error("signSchnorr cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signSchnorr;
