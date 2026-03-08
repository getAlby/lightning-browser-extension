"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const providerBase_1 = __importDefault(require("~/extension/providers/providerBase"));
class WebBTCProvider extends providerBase_1.default {
    constructor() {
        super("webbtc");
    }
    getInfo() {
        this._checkEnabled("getInfo");
        return this.execute("getInfo");
    }
    signPsbt(psbt) {
        this._checkEnabled("signPsbt");
        return this.execute("signPsbtWithPrompt", { psbt });
    }
    sendTransaction(address, amount) {
        this._checkEnabled("sendTransaction");
        throw new Error("Alby does not support `sendTransaction`");
    }
    getAddress() {
        this._checkEnabled("getAddress");
        return this.execute("getAddressOrPrompt", {});
    }
    request(method, params) {
        this._checkEnabled("request");
        throw new Error("Alby does not support `request`");
    }
}
exports.default = WebBTCProvider;
