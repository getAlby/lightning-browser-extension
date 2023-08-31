import utils from "~/common/lib/utils";
import { MessageSignPsetWithPrompt } from "~/types";

const signPsetWithPrompt = async (message: MessageSignPsetWithPrompt) => {
  const pset = message.args.pset;
  if (!pset || typeof pset !== "string") {
    return {
      error: "PSET missing.",
    };
  }

  try {
    const response = await utils.openPrompt({
      ...message,
      action: "public/liquid/confirmSignPset",
    });
    return response;
  } catch (e) {
    console.error("signPset cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signPsetWithPrompt;
