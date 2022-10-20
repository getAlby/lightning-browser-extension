const getRelays = async () => {
  return {
    data: [
      "wss://expensive-relay.fiatjaf.com",
      "wss://relay.damus.io",
      "wss://nostr-pub.wellorder.net",
    ],
  };
};

export default getRelays;
