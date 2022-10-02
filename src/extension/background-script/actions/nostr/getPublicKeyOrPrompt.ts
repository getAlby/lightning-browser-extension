import utils from "~/common/lib/utils";
import { Message } from "~/types";

import getPublicKey from "./getPublicKey";

const getPublicKeyOrPrompt = async (message: Message) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  const result = await prompt(message);

  return result;
};

const prompt = async (message: Message) => {
  try {
    const response = await utils.openPrompt({
      ...message,
      action: "nostr/confirmGetPublicKey",
    });

    const publicKey = await getPublicKey();

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
