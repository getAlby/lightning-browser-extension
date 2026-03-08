"use strict";
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
const axios_1 = __importDefault(require("axios"));
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const typeHelpers_1 = require("~/common/utils/typeHelpers");
const helpers_1 = require("../utils/helpers");
const fromInternetIdentifier = (address) => {
    // email regex: https://emailregex.com/
    // modified to allow _ in subdomains
    if (address.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-_0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        let [name, host] = address.split("@");
        // remove invisible characters %EF%B8%8F
        name = name.replace(/[^ -~]+/g, "");
        host = host.replace(/[^ -~]+/g, "");
        return `https://${host}/.well-known/lnurlp/${name}`;
    }
    return null;
};
const normalizeLnurl = (lnurlString) => {
    // maybe it's bech32 encoded?
    try {
        const url = (0, helpers_1.bech32Decode)(lnurlString);
        return new URL(url);
    }
    catch (e) {
        console.info("ignoring bech32 parsing error", e);
    }
    // maybe it's a lightning address?
    const urlFromAddress = fromInternetIdentifier(lnurlString);
    if (urlFromAddress) {
        return new URL(urlFromAddress);
    }
    //maybe it's already a URL?
    return new URL(`https://${lnurlString.replace(/^lnurl[pwc]/i, "")}`);
};
const lnurl = {
    isLightningAddress(address) {
        return Boolean(fromInternetIdentifier(address));
    },
    findLnurl(text) {
        const stringToText = text.trim();
        let match;
        // look for a LNURL with protocol scheme
        if ((match = stringToText.match(/lnurl[pwc]:(\S+)/i))) {
            return match[1];
        }
        // look for LNURL bech32 in the string
        if ((match = stringToText.match(/(lnurl[a-zA-HJ-NP-Z0-9]+)/i))) {
            return match[1];
        }
        return null;
    },
    getDetails(lnurlString) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const url = normalizeLnurl(lnurlString);
            const searchParamsTag = url.searchParams.get("tag");
            const searchParamsK1 = url.searchParams.get("k1");
            const searchParamsAction = url.searchParams.get("action");
            if (searchParamsTag && searchParamsTag === "login" && searchParamsK1) {
                const lnurlAuthDetails = Object.assign(Object.assign({}, (searchParamsAction && { action: searchParamsAction })), { domain: url.hostname, k1: searchParamsK1, tag: searchParamsTag, url: url.toString() });
                return lnurlAuthDetails;
            }
            else {
                try {
                    const { data } = yield axios_1.default.get(url.toString(), {
                        adapter: "fetch",
                    });
                    const lnurlDetails = data;
                    if ((0, typeHelpers_1.isLNURLDetailsError)(lnurlDetails)) {
                        throw new Error(lnurlDetails.reason);
                    }
                    else {
                        lnurlDetails.domain = url.hostname;
                        lnurlDetails.url = url.toString();
                    }
                    return lnurlDetails;
                }
                catch (e) {
                    let error = "";
                    if (axios_1.default.isAxiosError(e)) {
                        error =
                            ((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.reason) || e.message;
                        if (this.isLightningAddress(lnurlString)) {
                            error = `This is not a valid lightning address. Either the address is invalid or it is using a different and unsupported protocol: ${error}`;
                        }
                    }
                    else if (e instanceof Error) {
                        error = e.message;
                    }
                    throw new Error(error);
                }
            }
        });
    },
    verifyInvoice({ paymentInfo, amount, }) {
        const paymentRequestDetails = bolt11_signet_1.default.decode(paymentInfo.pr);
        switch (true) {
            case paymentRequestDetails.millisatoshis !== String(amount): // LN WALLET Verifies that amount in provided invoice equals an amount previously specified by user
            case paymentInfo.successAction &&
                !["url", "message", "aes"].includes(paymentInfo.successAction.tag): // If successAction is not null: LN WALLET makes sure that tag value of is of supported type, aborts a payment otherwise
                return false;
            default:
                return true;
        }
    },
};
exports.default = lnurl;
