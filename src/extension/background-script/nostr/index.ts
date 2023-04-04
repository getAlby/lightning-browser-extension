import * as secp256k1 from "@noble/secp256k1";
import { Buffer } from "buffer";
import * as CryptoJS from "crypto-js";
import { AES } from "crypto-js";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import { Event } from "~/extension/ln/nostr/types";

import { getEventHash, signEvent } from "../actions/nostr/helpers";

class Nostr {
  privateKey: string;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }

  getPublicKey() {
    const publicKey = secp256k1.schnorr.getPublicKey(
      secp256k1.utils.hexToBytes(this.privateKey)
    );
    const publicKeyHex = secp256k1.utils.bytesToHex(publicKey);
    return publicKeyHex;
  }

  async signEvent(event: Event): Promise<Event> {
    const signature = await signEvent(event, this.privateKey);
    event.sig = signature;
    return event;
  }

  async signSchnorr(sigHash: string): Promise<string> {
    const signature = await secp256k1.schnorr.sign(
      Buffer.from(secp256k1.utils.hexToBytes(sigHash)),
      secp256k1.utils.hexToBytes(this.privateKey)
    );
    const signedHex = secp256k1.utils.bytesToHex(signature);
    return signedHex;
  }

  encrypt(pubkey: string, text: string) {
    const key = secp256k1.getSharedSecret(this.privateKey, "02" + pubkey);
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

  async decrypt(pubkey: string, ciphertext: string) {
    const [cip, iv] = ciphertext.split("?iv=");
    const key = secp256k1.getSharedSecret(this.privateKey, "02" + pubkey);
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
