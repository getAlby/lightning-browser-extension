import utils from "~/common/lib/utils";
import { Message } from "~/types";

//import db from "../../db";
//import signMessage from "../ln/signMessage";
//import { getHostFromSender } from "~/common/utils/helpers";

const signMessageOrPrompt = async (message: Message) => {
  const messageToSign = message.args.message;
  if (typeof messageToSign !== "string") {
    return {
      error: "Message missing.",
    };
  }

  return signWithPrompt(message);

  /*
  const host = getHostFromSender(sender);
  if (!host) return;

	const allowance = await db.allowances
		.where("host")
		.equalsIgnoreCase(host)
		.first();


  // TODO: check allowance.autoSign
	if (allowance && false) {
		return signMessage(message);
	} else {
		return signWithPrompt(message);
	}
	*/
};

async function signWithPrompt(message: Message) {
  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmSignMessage",
    });
    return response;
  } catch (e) {
    console.error("SignMessage cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export default signMessageOrPrompt;
