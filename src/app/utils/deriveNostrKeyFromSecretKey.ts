import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";

export async function deriveNostrKeyFromSecretKey(mnemonic: string) {
  if (!mnemonic) {
    throw new Error("You haven't setup your secret key yet");
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  if (!hdkey) {
    throw new Error("invalid hdkey");
  }
  const nostrPrivateKeyBytes = hdkey.derive("m/1237'/0'/0").privateKey;
  if (!nostrPrivateKeyBytes) {
    throw new Error("invalid derived private key");
  }
  return Buffer.from(nostrPrivateKeyBytes).toString("hex");
}
