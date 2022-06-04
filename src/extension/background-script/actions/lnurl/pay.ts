import utils from "../../../../common/lib/utils";
import type { Message, LNURLDetails } from "../../../../types";

async function payWithPrompt(message: Message, lnurlDetails: LNURLDetails) {
  // for lnurl pay requests we always open a prompt
  // Question: does it help to support an allowance here?
  try {
    const response = await utils.openPrompt({
      origin: message.origin,
      action: "lnurlPay",
      args: { ...message.args, lnurlDetails },
    });
    return response; // response is an object like: `{ data: ... }`
  } catch (e) {
    return { error: e instanceof Error ? e.message : e };
  }
}

export default payWithPrompt;
