import { deriveNostrPrivateKey } from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";

export type NostrKeyOrigin =
  | "legacy-account-derived"
  | "unknown"
  | "secret-key";

export async function getNostrKeyOrigin(
  nostrPrivateKey: string,
  mnemonic: string | null
): Promise<NostrKeyOrigin> {
  if (mnemonic) {
    const mnemonicDerivedPrivateKey = await deriveNostrPrivateKey(mnemonic);

    if (mnemonicDerivedPrivateKey === nostrPrivateKey) {
      return "secret-key";
    }
  }

  // TODO: consider removing this at some point and just returning "unknown"
  const legacyAccountDerivedPrivateKeyResponse = await msg.request(
    "nostr/generatePrivateKey"
  );
  const legacyAccountDerivedPrivateKey =
    legacyAccountDerivedPrivateKeyResponse.privateKey;

  return legacyAccountDerivedPrivateKey === nostrPrivateKey
    ? "legacy-account-derived"
    : "unknown";
}
