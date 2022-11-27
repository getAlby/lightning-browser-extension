import state from "~/extension/background-script/state";
import { MessageDecryptGet } from "~/types";

const decryptOrPrompt = async (message: MessageDecryptGet) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  const result = await prompt(message);

  return result;
};

const prompt = async (message: MessageDecryptGet) => {
  try {
    // TODO: Add prompt & permissions

    const response = {
      data: state
        .getState()
        .getNostr()
        .decrypt(message.args.peer, message.args.ciphertext),
    };

    return response;
  } catch (e) {
    console.error("decrypt cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default decryptOrPrompt;
