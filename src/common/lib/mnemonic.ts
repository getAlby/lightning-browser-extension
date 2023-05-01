import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";

export function deriveNostrPrivateKey(mnemonic: string) {
  return deriveKey(mnemonic, 1237);
}
export function deriveKey(mnemonic: string, coinType: number) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  if (!hdkey) {
    throw new Error("invalid hdkey");
  }
  const privateKeyBytes = hdkey.derive(`m/${coinType}'/0'/0`).privateKey;
  if (!privateKeyBytes) {
    throw new Error("invalid derived private key");
  }
  return Buffer.from(privateKeyBytes).toString("hex");
}
