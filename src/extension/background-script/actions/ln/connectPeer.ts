import { Message } from "~/types";

import state from "../../state";

const connectPeer = async (message: Message) => {
  console.log(message);
  const { pubkey, host } = message.args;
  if (typeof pubkey !== "string" || typeof host !== "string") {
    return {
      error: "Peer data missing.",
    };
  }
  const connector = await state.getState().getConnector();

  const peer = {
    pubkey,
    host,
  };
  let response;
  try {
    response = await connector.connectPeer(peer);
  } catch (e) {
    console.error(e);
    response = {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }
  return response;
};

export default connectPeer;
