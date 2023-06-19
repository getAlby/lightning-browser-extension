import NostrProvider from "../providers/nostr";

if (document) {
  window.nostr = new NostrProvider();
}
