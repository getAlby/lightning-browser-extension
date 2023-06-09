import {
  deriveLiquidPrivateKey,
  deriveNostrPrivateKey,
} from "~/common/lib/mnemonic";
import msg from "~/common/lib/msg";

export type KeyOrigin = "legacy-account-derived" | "unknown" | "secret-key";

export async function getKeyOrigin(
  type: "nostr" | "liquid",
  privateKey: string,
  mnemonic: string | null
): Promise<KeyOrigin> {
  if (mnemonic) {
    const mnemonicDerivedPrivateKey =
      type === "nostr"
        ? await deriveNostrPrivateKey(mnemonic)
        : await deriveLiquidPrivateKey(mnemonic);

    if (mnemonicDerivedPrivateKey === privateKey) {
      return "secret-key";
    }
  }

  if (type === "liquid") return "unknown";

  // TODO: consider removing this at some point and just returning "unknown"
  const legacyAccountDerivedPrivateKey = (
    await msg.request("nostr/generatePrivateKey")
  ).privateKey;

  return legacyAccountDerivedPrivateKey === privateKey
    ? "legacy-account-derived"
    : "unknown";
}
