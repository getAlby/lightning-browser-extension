import axios from "axios";

import utils from "../../../../common/lib/utils";
import { decodeBech32 } from "../../../../common/utils/helpers";

async function lnurl(message, sender) {
  try {
    const lnurlDecoded = decodeBech32(message.args.lnurlEncoded);
    const { data: lnurlMetadata } = await axios.get(lnurlDecoded);
    const { tag: lnurlType } = lnurlMetadata;

    switch (lnurlType) {
      case "channelRequest":
        // lnurl-channel
        return;
      case "login":
        // lnurl-auth
        return;
      case "payRequest":
        return payWithPrompt(message, lnurlMetadata);
      case "withdrawRequest":
        // lnurl-withdraw
        return;
      default:
        return;
    }
  } catch (e) {
    console.log(e.message);
  }
}

async function payWithPrompt(message, lnurlMetadata) {
  const response = await utils.openPrompt({
    ...message,
    type: "lnurlPay",
    args: { ...message.args, lnurlMetadata },
  });
  if (response.data.confirmed) {
    // payment confirmed.
  }
}

export default lnurl;
