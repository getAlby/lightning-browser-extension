import utils from "../../../../common/lib/utils";
import { Message } from "../../../../types";

//import db from "../../db";
//import signMessage from "../ln/signMessage";

const signMessageOrPrompt = async (message: Message) => {
  const messageToSign = message.args.message;
  console.log(message);
  console.log(message.args);
  if (typeof messageToSign !== "string") {
    return {
      error: "Message missing.",
    };
  }

  return signWithPrompt(message);

  /*
	const host = message.origin.host;
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
      type: "confirmSignMessage",
    });
    return response;
  } catch (e) {
    console.log("SignMessage cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export default signMessageOrPrompt;
