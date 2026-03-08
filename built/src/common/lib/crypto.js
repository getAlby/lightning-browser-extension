"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptData = exports.encryptData = void 0;
const crypto_js_1 = require("crypto-js");
function encryptData(data, password) {
    return crypto_js_1.AES.encrypt(JSON.stringify(data), password).toString();
}
exports.encryptData = encryptData;
function decryptData(cipher, password) {
    const decrypted = crypto_js_1.AES.decrypt(cipher, password);
    return JSON.parse(decrypted.toString(crypto_js_1.enc.Utf8));
}
exports.decryptData = decryptData;
