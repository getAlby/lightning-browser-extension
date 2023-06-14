import * as secp256k1 from "@noble/secp256k1";
import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";

export const LIQUID_DERIVATION_PATH = "m/84'/1776'/0'/0/0";
export const LIQUID_DERIVATION_PATH_REGTEST = "m/84'/1'/0'/0/0";
export const NOSTR_DERIVATION_PATH = "m/44'/1237'/0'/0/0"; // NIP-06
export const BTC_TAPROOT_DERIVATION_PATH = "m/86'/0'/0'/0/0";
export const BTC_TAPROOT_DERIVATION_PATH_REGTEST = "m/86'/1'/0'/0/0";

export function deriveLiquidPrivateKey(mnemonic: string) {
  return derivePrivateKey(mnemonic, LIQUID_DERIVATION_PATH);
}

export function deriveNostrPrivateKey(mnemonic: string) {
  return derivePrivateKey(mnemonic, NOSTR_DERIVATION_PATH);
}

export function derivePrivateKey(mnemonic: string, path: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  const privateKeyBytes = hdkey.derive(path).privateKey;
  if (!privateKeyBytes) {
    throw new Error("invalid derived private key");
  }
  return secp256k1.utils.bytesToHex(privateKeyBytes);
}

export function derivePublicKey(mnemonic: string, path: string) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const hdkey = HDKey.fromMasterSeed(seed);
  const publicKeyBytes = hdkey.derive(path).publicKey;
  if (!publicKeyBytes) {
    throw new Error("invalid derived public key");
  }
  return secp256k1.utils.bytesToHex(publicKeyBytes);
}
