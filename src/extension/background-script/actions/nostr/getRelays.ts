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
    data: {
      "wss://relay.damus.io": { read: true, write: true },
      "wss://nostr1.tunnelsats.com": { read: true, write: true },
      "wss://nostr-pub.wellorder.net": { read: true, write: true },
      "wss://relay.nostr.info": { read: true, write: true },
      "wss://nostr-relay.wlvs.space": { read: true, write: true },
      "wss://nostr.bitcoiner.social": { read: true, write: true },
      "wss://nostr-01.bolt.observer": { read: true, write: true },
      "wss://relayer.fiatjaf.com": { read: true, write: true },
    },
  };
};

export default getRelays;
