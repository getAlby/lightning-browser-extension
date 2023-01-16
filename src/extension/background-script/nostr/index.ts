import * as secp256k1 from "@noble/secp256k1";
import { Buffer } from "buffer";
import * as CryptoJS from "crypto-js";
import { AES } from "crypto-js";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import { decryptData, encryptData } from "~/common/lib/crypto";
import { Event } from "~/extension/ln/nostr/types";

import { signEvent, getEventHash } from "../actions/nostr/helpers";
import state from "../state";

class Nostr {
  getPrivateKey() {
    const password = state.getState().password as string;
    const encryptedKey = state.getState().nostrPrivateKey as string;
    if (encryptedKey) {
      try {
        return decryptData(encryptedKey, password);
      } catch (e) {
        console.error("Could not decrypt the Nostr key");
        console.error(e);
      }
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

  async signEvent(event: Event): Promise<Event> {
    const signature = await signEvent(event, this.getPrivateKey());
    event.sig = signature;
    return event;
  }

  encrypt(pubkey: string, text: string) {
    const key = secp256k1.getSharedSecret(this.getPrivateKey(), "02" + pubkey);
    const normalizedKey = Buffer.from(key.slice(1, 33));
    const hexNormalizedKey = secp256k1.utils.bytesToHex(normalizedKey);
    const hexKey = Hex.parse(hexNormalizedKey);

    const encrypted = AES.encrypt(text, hexKey, {
      iv: CryptoJS.lib.WordArray.random(16),
    });

    return `${encrypted.toString()}?iv=${encrypted.iv.toString(
      CryptoJS.enc.Base64
    )}`;
  }

  decrypt(pubkey: string, ciphertext: string) {
    const [cip, iv] = ciphertext.split("?iv=");
    const key = secp256k1.getSharedSecret(this.getPrivateKey(), "02" + pubkey);
    const normalizedKey = Buffer.from(key.slice(1, 33));
    const hexNormalizedKey = secp256k1.utils.bytesToHex(normalizedKey);
    const hexKey = Hex.parse(hexNormalizedKey);

    const decrypted = AES.decrypt(cip, hexKey, {
      iv: Base64.parse(iv),
    });

    return Utf8.stringify(decrypted);
  }

  getEventHash(event: Event) {
    return getEventHash(event);
  }
}

export default Nostr;
