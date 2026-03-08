"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const providerBase_1 = __importDefault(require("~/extension/providers/providerBase"));
class WebLNProvider extends providerBase_1.default {
    constructor() {
        super("webln");
    }
    getInfo() {
        this._checkEnabled("getInfo");
        return this.execute("getInfo");
    }
    lnurl(lnurlEncoded) {
        this._checkEnabled("lnurl");
        return this.execute("lnurl", { lnurlEncoded });
    }
    sendPayment(paymentRequest) {
        this._checkEnabled("sendPayment");
        return this.execute("sendPaymentOrPrompt", { paymentRequest });
    }
    sendPaymentAsync(paymentRequest) {
        this._checkEnabled("sendPaymentAsync");
        return this.execute("sendPaymentAsyncWithPrompt", { paymentRequest });
    }
    keysend(args) {
        this._checkEnabled("keysend");
        return this.execute("keysendOrPrompt", args);
    }
    makeInvoice(args) {
        this._checkEnabled("makeInvoice");
        if (typeof args !== "object") {
            args = { amount: args };
        }
        return this.execute("makeInvoice", args);
    }
    signMessage(message) {
        this._checkEnabled("signMessage");
        return this.execute("signMessageOrPrompt", { message });
    }
    verifyMessage(signature, message) {
        this._checkEnabled("verifyMessage");
        throw new Error("Alby does not support `verifyMessage`");
    }
    getBalance() {
        this._checkEnabled("getBalance");
        return this.execute("getBalanceOrPrompt");
    }
    request(method, params) {
        this._checkEnabled("request");
        return this.execute("request", {
            method,
            params,
        });
    }
}
exports.default = WebLNProvider;
