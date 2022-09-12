import { Message } from "~/types";

const getRelays = async (message: Message) => {
  return {
    data: [
      "wss://expensive-relay.fiatjaf.com",
      "wss://relay.damus.io",
      "wss://nostr-pub.wellorder.net",
    ],
  };
};

export default getRelays;
