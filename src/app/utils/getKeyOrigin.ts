import { deriveNostrPrivateKey } from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";

export type KeyOrigin = "legacy-account-derived" | "unknown" | "secret-key";

export async function getKeyOrigin(
  privateKey: string,
  mnemonic: string | null
): Promise<KeyOrigin> {
  if (mnemonic) {
    const mnemonicDerivedPrivateKey = deriveNostrPrivateKey(mnemonic);

    if (mnemonicDerivedPrivateKey === privateKey) {
      return "secret-key";
    }
  }

  // TODO: consider removing this at some point and just returning "unknown"
  const legacyAccountDerivedPrivateKey = (
    await msg.request("nostr/generatePrivateKey")
  ).privateKey;

  return legacyAccountDerivedPrivateKey === privateKey
    ? "legacy-account-derived"
    : "unknown";
}
