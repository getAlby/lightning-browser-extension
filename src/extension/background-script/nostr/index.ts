import * as secp256k1 from "@noble/secp256k1";
import { decryptData, encryptData } from "~/common/lib/crypto";
import { Event } from "~/extension/ln/nostr/types";

import { signEvent } from "../actions/nostr/helpers";
import state from "../state";

class Nostr {
  getPrivateKey() {
    const password = state.getState().password as string;
    const encryptedKey = state.getState().nostrPrivateKey as string;
    if (encryptedKey) {
      return decryptData(encryptedKey, password);
    }

    return null;
  }

  getPublicKey() {
    const publicKey = secp256k1.schnorr.getPublicKey(
      secp256k1.utils.hexToBytes(this.getPrivateKey())
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
    const signature = await signEvent(event, this.getPrivateKey());
    return signature;
  }
}

export default Nostr;
