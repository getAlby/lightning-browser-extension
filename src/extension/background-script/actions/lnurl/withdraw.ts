import utils from "../../../../common/lib/utils";
import type { Message, LNURLDetails } from "../../../../types";

async function withdrawWithPrompt(
  message: Message,
  lnurlDetails: LNURLDetails
) {
  try {
    const response = await utils.openPrompt({
      origin: message.origin,
      action: "lnurlWithdraw",
      args: { ...message.args, lnurlDetails },
    });
    return response; // response is an object like: `{ data: ... }`
  } catch (e) {
    return { error: e instanceof Error ? e.message : e };
  }
}

export default withdrawWithPrompt;
