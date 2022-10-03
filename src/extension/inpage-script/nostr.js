import NostrProvider from "../ln/nostr";

if (document) {
  window.nostr = new NostrProvider();
}
