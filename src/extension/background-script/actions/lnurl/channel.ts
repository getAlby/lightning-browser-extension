import utils from "~/common/lib/utils";
// import state from "~/extension/background-script/state";
import type { Message, LNURLDetails } from "~/types";

async function channelRequestWithPrompt(
  message: Message,
  lnurlDetails: LNURLDetails
) {
  try {
    // const connector = await state.getState().getConnector();
    //   {
    //     "uri": string, // Remote node address of form node_key@ip_address:port_number
    //     "callback": string, // a second-level URL which would initiate an OpenChannel message from target LN node
    //     "k1": string, // random or non-random string to identify the user's LN WALLET when using the callback URL
    //     "tag": "channelRequest" // type of LNURL
    // }
    //LNURLDetails
    // split uri
    // hand host/pubkey into connector
    // if no error then callback-url with "k1"-string and our node id (get via getinfo)
    // connector.connectPeer();

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
