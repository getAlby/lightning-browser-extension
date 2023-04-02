import utils from "~/common/lib/utils";
import { Message } from "~/types";

const signPsbt = async (message: Message) => {
  const psbt = message.args.psbt;
  if (typeof psbt !== "string") {
    return {
      error: "PSBT missing.",
    };
  }

  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmSignPsbt",
    });
    return response;
  } catch (e) {
    console.error("signPsbt cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signPsbt;
