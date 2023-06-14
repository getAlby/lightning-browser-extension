import db from "~/extension/background-script/db";
import { MessageDefaultPublic, Sender } from "~/types";

const getRelays = async (message: MessageDefaultPublic, sender: Sender) => {
  let host;
  if (sender.origin) host = new URL(sender.origin).host;
  else if (sender.url) host = new URL(sender.url).host;
  else return;

  const allowance = await db.allowances.get({ host });

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
