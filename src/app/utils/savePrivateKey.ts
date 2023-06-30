import msg from "~/common/lib/msg";
import { default as nostr, default as nostrlib } from "~/common/lib/nostr";

export async function saveNostrPrivateKey(
  accountId: string,
  privateKey: string
) {
  if (privateKey) {
    privateKey = nostrlib.normalizeToHex(privateKey);
    // Validate the private key before saving
    nostr.generatePublicKey(privateKey);
    nostrlib.hexToNip19(privateKey, "nsec");

    await msg.request("nostr/setPrivateKey", {
      id: accountId,
      privateKey,
    });
  } else {
    await msg.request("nostr/removePrivateKey", {
      id: accountId,
    });
  }
}
