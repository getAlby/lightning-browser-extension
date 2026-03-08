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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeTransactions = exports.poll = exports.getHostFromSender = exports.bech32Encode = exports.bech32Decode = void 0;
const secp256k1 = __importStar(require("@noble/secp256k1"));
const bech32_1 = require("bech32");
function bech32Decode(str, encoding = "utf-8") {
    const { words: dataPart } = bech32_1.bech32.decode(str, 2000);
    const requestByteArray = bech32_1.bech32.fromWords(dataPart);
    return Buffer.from(requestByteArray).toString(encoding);
}
exports.bech32Decode = bech32Decode;
function bech32Encode(prefix, hex) {
    const data = secp256k1.etc.hexToBytes(hex);
    const words = bech32_1.bech32.toWords(data);
    return bech32_1.bech32.encode(prefix, words, 1000);
}
exports.bech32Encode = bech32Encode;
function getHostFromSender(sender) {
    // see https://github.com/uBlockOrigin/uBlock-issues/issues/1992
    // If present, use MessageSender.origin to determine whether the port is
    // from a privileged page, otherwise use MessageSender.url
    // MessageSender.origin is more reliable as it is not spoofable by a
    // compromised renderer.
    if (sender.origin)
        return new URL(sender.origin).host;
    else if (sender.url)
        return new URL(sender.url).host;
    else
        return null;
}
exports.getHostFromSender = getHostFromSender;
function poll({ fn, validate, interval, maxAttempts, shouldStopPolling, }) {
    return __awaiter(this, void 0, void 0, function* () {
        let attempts = 0;
        const executePoll = (resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (shouldStopPolling()) {
                return reject(new Error("Polling aborted manually"));
            }
            const result = yield fn();
            attempts++;
            if (validate(result)) {
                return resolve(result);
            }
            else if (maxAttempts && attempts === maxAttempts) {
                return reject(new Error("Exceeded max attempts"));
            }
            else {
                setTimeout(executePoll, interval, resolve, reject);
            }
        });
        return new Promise(executePoll);
    });
}
exports.poll = poll;
function mergeTransactions(invoices, payments) {
    const mergedTransactions = [...invoices, ...payments].sort((a, b) => {
        var _a, _b;
        return ((_a = b.settleDate) !== null && _a !== void 0 ? _a : 0) - ((_b = a.settleDate) !== null && _b !== void 0 ? _b : 0);
    });
    return mergedTransactions;
}
exports.mergeTransactions = mergeTransactions;
