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
const secp256k1 = __importStar(require("@noble/secp256k1"));
const bip32_1 = require("@scure/bip32");
const bip39 = __importStar(require("@scure/bip39"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
// TODO: move into nostr class
const NOSTR_DERIVATION_PATH = "m/44'/1237'/0'/0/0"; // NIP-06
class Mnemonic {
    constructor(mnemonic) {
        this.mnemonic = mnemonic;
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        this._hdkey = bip32_1.HDKey.fromMasterSeed(seed);
    }
    deriveNostrPrivateKeyHex() {
        return secp256k1.etc.bytesToHex(this.deriveKey(NOSTR_DERIVATION_PATH).privateKey);
    }
    deriveKey(path) {
        return this._hdkey.derive(path);
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageHex = (0, sha256_1.default)(message).toString(enc_hex_1.default);
            const signedMessageBytes = yield secp256k1.signAsync(messageHex, this._hdkey.privateKey);
            return secp256k1.etc.bytesToHex(signedMessageBytes.toCompactRawBytes());
        });
    }
}
exports.default = Mnemonic;
