import utils from "~/common/lib/utils";
import { MessagePublicKeyGet } from "~/types";

import state from "../../state";

const getPublicKeyOrPrompt = async (message: MessagePublicKeyGet) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  const result = await prompt(message);

  return result;
};

const prompt = async (message: MessagePublicKeyGet) => {
  try {
    const response = await utils.openPrompt({
      args: {},
      ...message,
      action: "public/nostr/confirmGetPublicKey",
    });

    const publicKey = await state.getState().getNostr().getPublicKey();
    response.data = publicKey;

    return response;
  } catch (e) {
    console.error("getPublicKey cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default getPublicKeyOrPrompt;
