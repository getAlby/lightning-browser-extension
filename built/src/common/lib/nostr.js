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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = __importStar(require("@noble/secp256k1"));
const nostr_1 = __importDefault(require("~/common/lib/nostr"));
const helpers_1 = require("../utils/helpers");
const nostr = {
    normalizeToHex(str) {
        const NIP19Prefixes = ["npub", "nsec", "note"];
        const prefix = str.substring(0, 4);
        if (NIP19Prefixes.includes(prefix)) {
            try {
                const hexStr = (0, helpers_1.bech32Decode)(str, "hex");
                return hexStr;
            }
            catch (e) {
                console.info("ignoring bech32 parsing error", e);
            }
        }
        return str;
    },
    hexToNip19(hex, prefix = "nsec") {
        return (0, helpers_1.bech32Encode)(prefix, hex);
    },
    derivePublicKey(privateKey) {
        const publicKey = secp256k1_1.schnorr.getPublicKey(secp256k1.etc.hexToBytes(privateKey));
        const publicKeyHex = secp256k1.etc.bytesToHex(publicKey);
        return nostr_1.default.hexToNip19(publicKeyHex, "npub");
    },
};
exports.default = nostr;
