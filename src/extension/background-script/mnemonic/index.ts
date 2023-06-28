import * as secp256k1 from "@noble/secp256k1";
import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";

const NOSTR_DERIVATION_PATH = "m/44'/1237'/0'/0/0"; // NIP-06

class Mnemonic {
  readonly mnemonic: string;
  private _hdkey: HDKey;

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    this._hdkey = HDKey.fromMasterSeed(seed);
  }

  deriveNostrPrivateKeyHex() {
    return secp256k1.utils.bytesToHex(
      this.deriveKey(NOSTR_DERIVATION_PATH).privateKey as Uint8Array
    );
  }

  deriveKey(path: string): HDKey {
    return this._hdkey.derive(path);
  }
}

export default Mnemonic;
