import { default as liquid } from "~/common/lib/liquid";
import msg from "~/common/lib/msg";
import { default as nostr, default as nostrlib } from "~/common/lib/nostr";

export async function savePrivateKey(
  type: "nostr" | "liquid",
  accountId: string,
  privateKey: string
) {
  if (type === "nostr") {
    privateKey = nostrlib.normalizeToHex(privateKey);
  }

  if (privateKey) {
    // Validate the private key before saving
    if (type === "nostr") {
      nostr.generatePublicKey(privateKey);
      nostrlib.hexToNip19(privateKey, "nsec");
    } else {
      liquid.generatePublicKey(privateKey);
    }

    await msg.request(`${type}/setPrivateKey`, {
      id: accountId,
      privateKey,
    });
  } else {
    await msg.request(`${type}/removePrivateKey`, {
      id: accountId,
    });
  }
}
