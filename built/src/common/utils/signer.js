"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elliptic_1 = __importDefault(require("elliptic"));
const ec = new elliptic_1.default.ec("secp256k1");
class HashKeySigner {
    constructor(keyHex) {
        this.keyHex = keyHex;
        if (!keyHex) {
            throw new Error("Invalid key");
        }
        this.sk = ec.keyFromPrivate(Buffer.from(keyHex, "hex"));
    }
    get pk() {
        return this.sk.getPublic();
    }
    get pkHex() {
        return this.pk.encodeCompressed("hex");
    }
    sign(message) {
        if (!message) {
            throw new Error("Invalid message");
        }
        return this.sk.sign(message, { canonical: true });
    }
    verify(message, signature) {
        try {
            return this.sk.verify(message, signature);
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
}
exports.default = HashKeySigner;
