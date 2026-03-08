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
exports.getEventHash = exports.signEvent = exports.serializeEvent = exports.validateEvent = void 0;
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = __importStar(require("@noble/secp256k1"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
// based upon : https://github.com/nbd-wtf/nostr-tools/blob/b9a7f814aaa08a4b1cec705517b664390abd3f69/event.ts#L95
// to avoid the additional dependency
function validateEvent(event) {
    if (!(event instanceof Object))
        return false;
    if (typeof event.kind !== "number")
        return false;
    if (typeof event.content !== "string")
        return false;
    if (typeof event.created_at !== "number")
        return false;
    // ignore pubkey checks because if the pubkey is not set we add it to the event. same for the ID.
    if (!Array.isArray(event.tags))
        return false;
    for (let i = 0; i < event.tags.length; i++) {
        const tag = event.tags[i];
        if (!Array.isArray(tag))
            return false;
        for (let j = 0; j < tag.length; j++) {
            if (typeof tag[j] === "object")
                return false;
        }
    }
    return true;
}
exports.validateEvent = validateEvent;
// from: https://github.com/nbd-wtf/nostr-tools/blob/160987472fd4922dd80c75648ca8939dd2d96cc0/event.ts#L42
// to avoid the additional dependency
function serializeEvent(evt) {
    if (!validateEvent(evt))
        throw new Error("can't serialize event with wrong or missing properties");
    return JSON.stringify([
        0,
        evt.pubkey,
        evt.created_at,
        evt.kind,
        evt.tags,
        evt.content,
    ]);
}
exports.serializeEvent = serializeEvent;
function signEvent(event, key) {
    return __awaiter(this, void 0, void 0, function* () {
        const signedEvent = yield secp256k1_1.schnorr.sign(getEventHash(event), key);
        return secp256k1.etc.bytesToHex(signedEvent);
    });
}
exports.signEvent = signEvent;
function getEventHash(event) {
    return (0, sha256_1.default)(serializeEvent(event)).toString(enc_hex_1.default);
}
exports.getEventHash = getEventHash;
