import * as secp256k1 from "@noble/secp256k1";
import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";

const debug = process.env.NODE_ENV === "development";

export function deriveNostrPrivateKey(mnemonic: string) {
  return deriveKey(mnemonic, 1237);
}
export function deriveBitcoinPrivateKey(mnemonic: string, testnet = debug) {
  return deriveKey(mnemonic, testnet ? 1 : 0);
}
export function getRootPrivateKey(mnemonic: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  if (!hdkey.privateKey) {
    throw new Error("invalid key");
  }
  return secp256k1.utils.bytesToHex(hdkey.privateKey);
}
export function deriveKey(mnemonic: string, coinType: number) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  const privateKeyBytes = hdkey.derive(`m/${coinType}'/0'/0`).privateKey;
  if (!privateKeyBytes) {
    throw new Error("invalid derived private key");
  }
  return secp256k1.utils.bytesToHex(privateKeyBytes);
}
