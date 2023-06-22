import * as secp256k1 from "@noble/secp256k1";
import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";

export const NOSTR_DERIVATION_PATH = "m/44'/1237'/0'/0/0"; // NIP-06

class Mnemonic {
  readonly mnemonic: string;
  private _hdkey: HDKey;

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    this._hdkey = HDKey.fromMasterSeed(seed);
  }

  deriveNostrPrivateKey() {
    return this.derivePrivateKey(NOSTR_DERIVATION_PATH);
  }

  derivePrivateKey(path: string) {
    const privateKeyBytes = this._hdkey.derive(path).privateKey;
    if (!privateKeyBytes) {
      throw new Error("invalid derived private key");
    }
    return secp256k1.utils.bytesToHex(privateKeyBytes);
  }

  derivePublicKey(path: string) {
    const publicKeyBytes = this._hdkey.derive(path).publicKey;
    if (!publicKeyBytes) {
      throw new Error("invalid derived public key");
    }
    return secp256k1.utils.bytesToHex(publicKeyBytes);
  }
}

export default Mnemonic;
