import axios from "axios";

import utils from "../../../../common/lib/utils";
import { decodeBech32 } from "../../../../common/utils/helpers";

async function lnurl(message) {
  try {
    const lnurlDecoded = decodeBech32(message.args.lnurlEncoded);
    const url = new URL(lnurlDecoded);
    let lnurlType = url.searchParams.get("tag");
    let lnurlDetails;

    if (lnurlType === "login") {
      lnurlDetails = {
        k1: url.searchParams.get("k1"),
        action: url.searchParams.get("action"),
      };
    } else {
      const res = await axios.get(lnurlDecoded);
      lnurlDetails = res.data;
      lnurlType = res.data.tag;
    }

    switch (lnurlType) {
      case "channelRequest":
        console.log("lnurl-channel");
        return;
      case "login":
        console.log("lnurl-auth");
        console.log(lnurlDetails);
        return;
      case "payRequest":
        return payWithPrompt(message, lnurlDetails);
      case "withdrawRequest":
        console.log("lnurl-withdraw");
        return;
      default:
        return;
    }
  } catch (e) {
    console.log(e.message);
  }
}

async function payWithPrompt(message, lnurlDetails) {
  const response = await utils.openPrompt({
    ...message,
    type: "lnurlPay",
    args: { ...message.args, lnurlDetails },
  });
  if (response.data.confirmed) {
    // payment confirmed.
  }
}

export default lnurl;
