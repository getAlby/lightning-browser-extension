import { schnorr } from "@noble/curves/secp256k1";
import * as secp256k1 from "@noble/secp256k1";
import { Buffer } from "buffer";
import * as CryptoJS from "crypto-js";
import { AES } from "crypto-js";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import { LRUCache } from "~/common/utils/lruCache";
import { Event } from "~/extension/providers/nostr/types";
import { nip44 } from "./nip44";

import { getEventHash, signEvent } from "../actions/nostr/helpers";

class Nostr {
  nip44SharedSecretCache = new LRUCache<string, Uint8Array>(100);

  constructor(readonly privateKey: string) {}

  // Deriving shared secret is an expensive computation
  getNip44SharedSecret(peerPubkey: string) {
    let key = this.nip44SharedSecretCache.get(peerPubkey);

    if (!key) {
      key = nip44.utils.getConversationKey(this.privateKey, peerPubkey);

      this.nip44SharedSecretCache.set(peerPubkey, key);
    }

    return key;
  }

  getPublicKey() {
    const publicKey = schnorr.getPublicKey(
      secp256k1.etc.hexToBytes(this.privateKey)
    );
    const publicKeyHex = secp256k1.etc.bytesToHex(publicKey);
    return publicKeyHex;
  }

  async signEvent(event: Event): Promise<Event> {
    const signature = await signEvent(event, this.privateKey);
    event.sig = signature;
    return event;
  }

  async signSchnorr(sigHash: string): Promise<string> {
    const signature = await schnorr.sign(
      Buffer.from(secp256k1.etc.hexToBytes(sigHash)),
      secp256k1.etc.hexToBytes(this.privateKey)
    );
    const signedHex = secp256k1.etc.bytesToHex(signature);
    return signedHex;
  }

  nip04Encrypt(pubkey: string, text: string) {
    const key = secp256k1.getSharedSecret(this.privateKey, "02" + pubkey);
    const normalizedKey = Buffer.from(key.slice(1, 33));
    const hexNormalizedKey = secp256k1.etc.bytesToHex(normalizedKey);
    const hexKey = Hex.parse(hexNormalizedKey);

    const encrypted = AES.encrypt(text, hexKey, {
      iv: CryptoJS.lib.WordArray.random(16),
    });

    return `${encrypted.toString()}?iv=${encrypted.iv.toString(
      CryptoJS.enc.Base64
    )}`;
  }

  async nip04Decrypt(pubkey: string, ciphertext: string) {
    const [cip, iv] = ciphertext.split("?iv=");
    const key = secp256k1.getSharedSecret(this.privateKey, "02" + pubkey);
    const normalizedKey = Buffer.from(key.slice(1, 33));
    const hexNormalizedKey = secp256k1.etc.bytesToHex(normalizedKey);
    const hexKey = Hex.parse(hexNormalizedKey);

    const decrypted = AES.decrypt(cip, hexKey, {
      iv: Base64.parse(iv),
    });

    return Utf8.stringify(decrypted);
  }

  nip44Encrypt(peer: string, plaintext: string) {
    return nip44.encrypt(plaintext, this.getNip44SharedSecret(peer));
  }

  nip44Decrypt(peer: string, ciphertext: string) {
    return nip44.decrypt(ciphertext, this.getNip44SharedSecret(peer));
  }

  getEventHash(event: Event) {
    return getEventHash(event);
  }
}

export default Nostr;
