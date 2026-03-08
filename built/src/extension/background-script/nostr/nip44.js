"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nip44 = void 0;
const chacha_1 = require("@noble/ciphers/chacha");
const utils_1 = require("@noble/ciphers/utils");
const secp256k1_1 = require("@noble/curves/secp256k1");
const hkdf_1 = require("@noble/hashes/hkdf");
const hmac_1 = require("@noble/hashes/hmac");
const sha256_1 = require("@noble/hashes/sha256");
const utils_2 = require("@noble/hashes/utils");
const base_1 = require("@scure/base");
// Extracted from https://github.com/nbd-wtf/nostr-tools
const decoder = new TextDecoder();
const u = {
    minPlaintextSize: 0x0001,
    maxPlaintextSize: 0xffff,
    utf8Encode: utils_2.utf8ToBytes,
    utf8Decode(bytes) {
        return decoder.decode(bytes);
    },
    getConversationKey(privkeyA, pubkeyB) {
        const sharedX = secp256k1_1.secp256k1
            .getSharedSecret(privkeyA, "02" + pubkeyB)
            .subarray(1, 33);
        return (0, hkdf_1.extract)(sha256_1.sha256, sharedX, "nip44-v2");
    },
    getMessageKeys(conversationKey, nonce) {
        const keys = (0, hkdf_1.expand)(sha256_1.sha256, conversationKey, nonce, 76);
        return {
            chacha_key: keys.subarray(0, 32),
            chacha_nonce: keys.subarray(32, 44),
            hmac_key: keys.subarray(44, 76),
        };
    },
    calcPaddedLen(len) {
        if (!Number.isSafeInteger(len) || len < 1)
            throw new Error("expected positive integer");
        if (len <= 32)
            return 32;
        const nextPower = 1 << (Math.floor(Math.log2(len - 1)) + 1);
        const chunk = nextPower <= 256 ? 32 : nextPower / 8;
        return chunk * (Math.floor((len - 1) / chunk) + 1);
    },
    writeU16BE(num) {
        if (!Number.isSafeInteger(num) ||
            num < u.minPlaintextSize ||
            num > u.maxPlaintextSize)
            throw new Error("invalid plaintext size: must be between 1 and 65535 bytes");
        const arr = new Uint8Array(2);
        new DataView(arr.buffer).setUint16(0, num, false);
        return arr;
    },
    pad(plaintext) {
        const unpadded = u.utf8Encode(plaintext);
        const unpaddedLen = unpadded.length;
        const prefix = u.writeU16BE(unpaddedLen);
        const suffix = new Uint8Array(u.calcPaddedLen(unpaddedLen) - unpaddedLen);
        return (0, utils_2.concatBytes)(prefix, unpadded, suffix);
    },
    unpad(padded) {
        const unpaddedLen = new DataView(padded.buffer).getUint16(0);
        const unpadded = padded.subarray(2, 2 + unpaddedLen);
        if (unpaddedLen < u.minPlaintextSize ||
            unpaddedLen > u.maxPlaintextSize ||
            unpadded.length !== unpaddedLen ||
            padded.length !== 2 + u.calcPaddedLen(unpaddedLen))
            throw new Error("invalid padding");
        return u.utf8Decode(unpadded);
    },
    hmacAad(key, message, aad) {
        if (aad.length !== 32)
            throw new Error("AAD associated data must be 32 bytes");
        const combined = (0, utils_2.concatBytes)(aad, message);
        return (0, hmac_1.hmac)(sha256_1.sha256, key, combined);
    },
    // metadata: always 65b (version: 1b, nonce: 32b, max: 32b)
    // plaintext: 1b to 0xffff
    // padded plaintext: 32b to 0xffff
    // ciphertext: 32b+2 to 0xffff+2
    // raw payload: 99 (65+32+2) to 65603 (65+0xffff+2)
    // compressed payload (base64): 132b to 87472b
    decodePayload(payload) {
        if (typeof payload !== "string")
            throw new Error("payload must be a valid string");
        const plen = payload.length;
        if (plen < 132 || plen > 87472)
            throw new Error("invalid payload length: " + plen);
        if (payload[0] === "#")
            throw new Error("unknown encryption version");
        let data;
        try {
            data = base_1.base64.decode(payload);
        }
        catch (error) {
            throw new Error("invalid base64: " + error.message);
        }
        const dlen = data.length;
        if (dlen < 99 || dlen > 65603)
            throw new Error("invalid data length: " + dlen);
        const vers = data[0];
        if (vers !== 2)
            throw new Error("unknown encryption version " + vers);
        return {
            nonce: data.subarray(1, 33),
            ciphertext: data.subarray(33, -32),
            mac: data.subarray(-32),
        };
    },
};
function encrypt(plaintext, conversationKey, nonce = (0, utils_2.randomBytes)(32)) {
    const { chacha_key, chacha_nonce, hmac_key } = u.getMessageKeys(conversationKey, nonce);
    const padded = u.pad(plaintext);
    const ciphertext = (0, chacha_1.chacha20)(chacha_key, chacha_nonce, padded);
    const mac = u.hmacAad(hmac_key, ciphertext, nonce);
    return base_1.base64.encode((0, utils_2.concatBytes)(new Uint8Array([2]), nonce, ciphertext, mac));
}
function decrypt(payload, conversationKey) {
    const { nonce, ciphertext, mac } = u.decodePayload(payload);
    const { chacha_key, chacha_nonce, hmac_key } = u.getMessageKeys(conversationKey, nonce);
    const calculatedMac = u.hmacAad(hmac_key, ciphertext, nonce);
    if (!(0, utils_1.equalBytes)(calculatedMac, mac))
        throw new Error("invalid MAC");
    const padded = (0, chacha_1.chacha20)(chacha_key, chacha_nonce, ciphertext);
    return u.unpad(padded);
}
exports.nip44 = {
    utils: u,
    encrypt,
    decrypt,
};
exports.default = { nip44: exports.nip44 };
