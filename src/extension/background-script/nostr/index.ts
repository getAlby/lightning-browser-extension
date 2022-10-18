import * as secp256k1 from "@noble/secp256k1";
import { encryptData } from "~/common/lib/crypto";
import { Event } from "~/extension/ln/nostr/types";

import { signEvent } from "../actions/nostr/helpers";
import state from "../state";

class Nostr {
  decryptedPrivateKey: string;

  constructor(decryptedPrivateKey: string) {
    this.decryptedPrivateKey = decryptedPrivateKey;
  }

  getPublicKey() {
    const publicKey = secp256k1.schnorr.getPublicKey(
      secp256k1.utils.hexToBytes(this.decryptedPrivateKey)
    );
    const publicKeyHex = secp256k1.utils.bytesToHex(publicKey);
    return publicKeyHex;
  }

  async setPrivateKey(privateKey: string) {
    const password = state.getState().password as string;

    state.setState({ nostrPrivateKey: encryptData(privateKey, password) });
    await state.getState().saveToStorage();
  }

  async signEvent(event: Event): Promise<string> {
    const signedEvent = await signEvent(event, this.decryptedPrivateKey);
    return signedEvent;
  }
}

export default Nostr;
