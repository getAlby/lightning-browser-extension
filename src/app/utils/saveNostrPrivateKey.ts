import msg from "~/common/lib/msg";
import { default as nostr, default as nostrlib } from "~/common/lib/nostr";

// TODO: remove this function and make setPrivateKey also handle removing private key
export async function saveNostrPrivateKey(
  accountId: string,
  nostrPrivateKey: string
) {
  nostrPrivateKey = nostrlib.normalizeToHex(nostrPrivateKey);

  if (nostrPrivateKey) {
    // TODO: move to background script
    // Validate the private key before saving
    nostr.generatePublicKey(nostrPrivateKey);
    nostrlib.hexToNip19(nostrPrivateKey, "nsec");

    await msg.request("nostr/setPrivateKey", {
      id: accountId,
      privateKey: nostrPrivateKey,
    });
  } else {
    await msg.request("nostr/removePrivateKey", {
      id: accountId,
    });
  }
}
