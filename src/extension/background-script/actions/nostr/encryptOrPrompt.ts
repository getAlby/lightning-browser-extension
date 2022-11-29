import state from "~/extension/background-script/state";
import { MessageEncryptGet } from "~/types";

const encryptOrPrompt = async (message: MessageEncryptGet) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  const result = await prompt(message);

  return result;
};

const prompt = async (message: MessageEncryptGet) => {
  try {
    // TODO: Add prompt & permissions

    const response = {
      data: state
        .getState()
        .getNostr()
        .encrypt(message.args.peer, message.args.plaintext),
    };

    return response;
  } catch (e) {
    console.error("encrypt failed", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default encryptOrPrompt;
