import * as secp256k1 from "@noble/secp256k1";
import { decryptData, encryptData } from "~/common/lib/crypto";
import { Event } from "~/extension/ln/nostr/types";
import { signEvent } from "../actions/nostr/helpers";
import state from "../state";
import aes from 'browserify-cipher';
import {Buffer} from 'buffer'
import { AES } from 'crypto-js';
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import Base64 from "crypto-js/enc-base64";
import * as CryptoJS from 'crypto-js';
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

  async signEvent(event: Event): Promise<Event> {
    const signature = await signEvent(event, this.getPrivateKey());
    event.sig = signature;
    return event;
  }

  encrypt(pubkey: string, text: string) {
    let key = secp256k1.getSharedSecret(this.getPrivateKey(), '02' + pubkey);
    const normalizedKey = Buffer.from(key.slice(1, 33));
    const hexNormalizedKey = secp256k1.utils.bytesToHex(normalizedKey);
    var hexKey = Hex.parse(hexNormalizedKey);

    const encrypted = AES.encrypt(text, hexKey, { iv: CryptoJS.lib.WordArray.random(16) });
    
    return `${(encrypted.toString())}?iv=${(encrypted.iv.toString(CryptoJS.enc.Base64))}`;
  }
  
  decrypt(pubkey: string, ciphertext: string) {
    let [cip, iv] = ciphertext.split('?iv=')
    let key = secp256k1.getSharedSecret(this.getPrivateKey(), '02' + pubkey);
    const normalizedKey = Buffer.from(key.slice(1, 33));
    const hexNormalizedKey = secp256k1.utils.bytesToHex(normalizedKey);
    var hexKey = Hex.parse(hexNormalizedKey);
    
    const decrypted = AES.decrypt(cip, hexKey, {
      iv: Base64.parse(iv)
    });
  
    return Utf8.stringify(decrypted);
  }
}

export default Nostr;
