import utils from "~/common/lib/utils";
// import state from "~/extension/background-script/state";
import type { Message, LNURLDetails } from "~/types";

async function channelRequestWithPrompt(
  message: Message,
  lnurlDetails: LNURLDetails
) {
  console.log("HALLO", message);

  //   {
  //     "action": "webln/lnurl",
  //     "args": {
  //         "lnurlEncoded": "lnurl1dp68gurn8ghj7emfwd6zuemfw3582cn4wdjhycm0de6x2mn59e3k7mf0vf6k66f0v5unyetpxpnxzcfe8y6nvdehxv6rgwtzv3nrqdfnxenrxcfsx5cj7unpwuhnjet9vf3xvep58ymrvc35x5mnzwrxxcmnsvpcv5uxydeevf3nzefsxy6kxde3x5cj7mrww4excttrdpskumn9dshx5um0dcu3u3uu"
  //     },
  //     "application": "LBE",
  //     "public": true,
  //     "prompt": true,
  //     "origin": {
  //         "location": "https://getalby.com/",
  //         "domain": "https://getalby.com",
  //         "host": "getalby.com",
  //         "pathname": "/",
  //         "name": "Alby",
  //         "description": "Alby brings Bitcoin to the web with in-browser payments and identity.",
  //         "icon": "https://getalby.com/website/_assets/alby_icon_head_icon-ICVYH45J.png",
  //         "metaData": {
  //             "title": "Alby — Lightning buzz for your Browser!",
  //             "description": "Alby brings Bitcoin to the web with in-browser payments and identity.",
  //             "type": "website",
  //             "url": "https://getalby.com/",
  //             "provider": "Alby",
  //             "author": "@getalby",
  //             "twitter": "@getalby",
  //             "image": "https://getalby.com/website/_assets/og_image-2VZ2D3IA.png",
  //             "icon": "https://getalby.com/website/_assets/alby_icon_head_icon-ICVYH45J.png",
  //             "monetization": "lnurlp:hello@getalby.com"
  //         },
  //         "external": true
  //     }
  // }

  try {
    const response = await utils.openPrompt({
      origin: message.origin,
      action: "lnurlOpenChannel",
      args: { ...message.args, lnurlDetails },
    });
    return response; // response is an object like: `{ data: ... }`
  } catch (e) {
    return { error: e instanceof Error ? e.message : e };
  }
}

export default channelRequestWithPrompt;
