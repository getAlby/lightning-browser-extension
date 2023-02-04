import * as secp256k1 from "@noble/secp256k1";
import { Buffer } from "buffer";
import * as CryptoJS from "crypto-js";
import { AES } from "crypto-js";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import sha256 from "crypto-js/sha256";
import { Event, Nip26DelegateConditions } from "~/extension/ln/nostr/types";

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

  decrypt(pubkey: string, ciphertext: string) {
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

  async delegate(delegateePubkey: string, conditions: Nip26DelegateConditions) {
    const cond = [];

    if (conditions.kind) cond.push(`kind=${conditions.kind}`);
    if (conditions.until) cond.push(`created_at>${conditions.until}`);
    if (conditions.since) cond.push(`created_at<${conditions.since}`);
    if (conditions.content)
      cond.push(`content=${encodeURIComponent(conditions.content)}`);

    const encodedConditions = cond.join("&");

    // refuse to sign if there are no conditions
    if (encodedConditions === "") {
      throw new Error("No conditions specified");
    }

    const sighash = sha256(
      Utf8.parse(`nostr:delegation:${delegateePubkey}:${encodedConditions}`)
    ).toString(Hex);

    const signSync = await secp256k1.schnorr.sign(sighash, this.privateKey);
    const sig = secp256k1.utils.bytesToHex(signSync);

    return { cond: encodedConditions, sig };
  }

  getEventHash(event: Event) {
    return getEventHash(event);
  }
}

export default Nostr;
