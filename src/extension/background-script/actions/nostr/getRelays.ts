import db from "~/extension/background-script/db";
import { MessageDefaultPublic } from "~/types";

const getRelays = async (message: MessageDefaultPublic) => {
  const allowance = await db.allowances.get({
    host: message.origin.host,
  });

  if (!allowance?.id) {
    return { error: "Could not find an allowance for this host" };
  }

  return {
    data: [
      "wss://expensive-relay.fiatjaf.com",
      "wss://relay.damus.io",
      "wss://nostr-pub.wellorder.net",
    ],
  };
};

export default getRelays;
