import NostrProvider from "../ln/webln/nostr";

if (document) {
  window.nostr = new NostrProvider();
}
