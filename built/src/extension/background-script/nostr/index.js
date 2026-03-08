"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = __importStar(require("@noble/secp256k1"));
const buffer_1 = require("buffer");
const CryptoJS = __importStar(require("crypto-js"));
const crypto_js_1 = require("crypto-js");
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const lruCache_1 = require("~/common/utils/lruCache");
const nip44_1 = require("./nip44");
const helpers_1 = require("../actions/nostr/helpers");
class Nostr {
    constructor(privateKey) {
        this.privateKey = privateKey;
        this.nip44SharedSecretCache = new lruCache_1.LRUCache(100);
    }
    // Deriving shared secret is an expensive computation
    getNip44SharedSecret(peerPubkey) {
        let key = this.nip44SharedSecretCache.get(peerPubkey);
        if (!key) {
            key = nip44_1.nip44.utils.getConversationKey(this.privateKey, peerPubkey);
            this.nip44SharedSecretCache.set(peerPubkey, key);
        }
        return key;
    }
    getPublicKey() {
        const publicKey = secp256k1_1.schnorr.getPublicKey(secp256k1.etc.hexToBytes(this.privateKey));
        const publicKeyHex = secp256k1.etc.bytesToHex(publicKey);
        return publicKeyHex;
    }
    signEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const signature = yield (0, helpers_1.signEvent)(event, this.privateKey);
            event.sig = signature;
            return event;
        });
    }
    signSchnorr(sigHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const signature = yield secp256k1_1.schnorr.sign(buffer_1.Buffer.from(secp256k1.etc.hexToBytes(sigHash)), secp256k1.etc.hexToBytes(this.privateKey));
            const signedHex = secp256k1.etc.bytesToHex(signature);
            return signedHex;
        });
    }
    nip04Encrypt(pubkey, text) {
        const key = secp256k1.getSharedSecret(this.privateKey, "02" + pubkey);
        const normalizedKey = buffer_1.Buffer.from(key.slice(1, 33));
        const hexNormalizedKey = secp256k1.etc.bytesToHex(normalizedKey);
        const hexKey = enc_hex_1.default.parse(hexNormalizedKey);
        const encrypted = crypto_js_1.AES.encrypt(text, hexKey, {
            iv: CryptoJS.lib.WordArray.random(16),
        });
        return `${encrypted.toString()}?iv=${encrypted.iv.toString(CryptoJS.enc.Base64)}`;
    }
    nip04Decrypt(pubkey, ciphertext) {
        return __awaiter(this, void 0, void 0, function* () {
            const [cip, iv] = ciphertext.split("?iv=");
            const key = secp256k1.getSharedSecret(this.privateKey, "02" + pubkey);
            const normalizedKey = buffer_1.Buffer.from(key.slice(1, 33));
            const hexNormalizedKey = secp256k1.etc.bytesToHex(normalizedKey);
            const hexKey = enc_hex_1.default.parse(hexNormalizedKey);
            const decrypted = crypto_js_1.AES.decrypt(cip, hexKey, {
                iv: enc_base64_1.default.parse(iv),
            });
            return enc_utf8_1.default.stringify(decrypted);
        });
    }
    nip44Encrypt(peer, plaintext) {
        return nip44_1.nip44.encrypt(plaintext, this.getNip44SharedSecret(peer));
    }
    nip44Decrypt(peer, ciphertext) {
        return nip44_1.nip44.decrypt(ciphertext, this.getNip44SharedSecret(peer));
    }
    getEventHash(event) {
        return (0, helpers_1.getEventHash)(event);
    }
}
exports.default = Nostr;
