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
exports.getPathSuffix = exports.authFunction = void 0;
const secp256k1 = __importStar(require("@noble/secp256k1"));
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const hmac_sha256_1 = __importDefault(require("crypto-js/hmac-sha256"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const pubsub_js_1 = __importDefault(require("pubsub-js"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const signer_1 = __importDefault(require("~/common/utils/signer"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const LNURLAUTH_CANONICAL_PHRASE = "DO NOT EVER SIGN THIS TEXT WITH YOUR PRIVATE KEYS! IT IS ONLY USED FOR DERIVATION OF LNURL-AUTH HASHING-KEY, DISCLOSING ITS SIGNATURE WILL COMPROMISE YOUR LNURL-AUTH IDENTITY AND MAY LEAD TO LOSS OF FUNDS!";
/*
  Execute the LNURL auth
  returns the response of the LNURL-auth login request
   or throws an error
*/
function authFunction({ lnurlDetails, origin, }) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (lnurlDetails.tag !== "login")
            throw new Error(`LNURL-AUTH FAIL: incorrect tag: ${lnurlDetails.tag} was used`);
        const account = yield state_1.default.getState().getAccount();
        if (!account) {
            throw new Error("LNURL-AUTH FAIL: no account selected");
        }
        const url = new URL(lnurlDetails.url);
        if (!url.host) {
            throw new Error("Invalid input");
        }
        let linkingKeyPriv;
        // use mnemonic for LNURL auth
        if (account.mnemonic && account.useMnemonicForLnurlAuth) {
            const mnemonic = yield state_1.default.getState().getMnemonic();
            // See https://github.com/lnurl/luds/blob/luds/05.md
            const hashingKey = mnemonic.deriveKey("m/138'/0");
            const hashingPrivateKey = hashingKey.privateKey;
            const pathSuffix = getPathSuffix(url.host, secp256k1.etc.bytesToHex(hashingPrivateKey));
            // Derive key manually (rather than using mnemonic.deriveKey with full path) due to
            // https://github.com/paulmillr/scure-bip32/issues/8
            let linkingKey = mnemonic.deriveKey("m/138'");
            for (const index of pathSuffix) {
                linkingKey = linkingKey.deriveChild(index);
            }
            linkingKeyPriv = secp256k1.etc.bytesToHex(linkingKey.privateKey);
        }
        else {
            const connector = yield state_1.default.getState().getConnector();
            // Note: the signMessage call can fail / this is currently not caught.
            const signResponse = yield connector.signMessage({
                message: LNURLAUTH_CANONICAL_PHRASE,
                key_loc: {
                    key_family: 0,
                    key_index: 0,
                },
            });
            const keyMaterialForSignature = signResponse.data.signature;
            // make sure we got a signature
            if (!keyMaterialForSignature) {
                throw new Error("Invalid Signature");
            }
            const hashingKey = (0, sha256_1.default)(keyMaterialForSignature).toString(enc_hex_1.default);
            linkingKeyPriv = (0, hmac_sha256_1.default)(url.host, enc_hex_1.default.parse(hashingKey)).toString(enc_hex_1.default);
        }
        // make sure we got a linkingkey (just to be sure for whatever reason)
        if (!linkingKeyPriv) {
            throw new Error("Invalid linkingKey");
        }
        const signer = new signer_1.default(linkingKeyPriv);
        const k1 = utils_1.default.hexToUint8Array(lnurlDetails.k1);
        if (!lnurlDetails.k1 || !k1) {
            throw new Error("Invalid K1");
        }
        const signedMessage = signer.sign(k1);
        const signedMessageDERHex = signedMessage.toDER("hex");
        const loginURL = url;
        loginURL.searchParams.set("sig", signedMessageDERHex);
        loginURL.searchParams.set("key", signer.pkHex);
        loginURL.searchParams.set("t", Date.now().toString());
        try {
            const authResponse = yield axios_1.default.get(loginURL.toString(), {
                adapter: "fetch",
            });
            // if the service returned with a HTTP 200 we still check if the response data is OK
            if (((_a = authResponse === null || authResponse === void 0 ? void 0 : authResponse.data.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== "OK") {
                throw new Error(((_b = authResponse === null || authResponse === void 0 ? void 0 : authResponse.data) === null || _b === void 0 ? void 0 : _b.reason) || "Auth: Something went wrong");
            }
            else {
                pubsub_js_1.default.publish(`lnurl.auth.success`, {
                    authResponse,
                    lnurlDetails,
                    origin,
                });
                const response = {
                    success: true,
                    status: authResponse.data.status,
                    reason: authResponse.data.reason,
                    authResponseData: authResponse.data,
                };
                return response;
            }
        }
        catch (e) {
            if (axios_1.default.isAxiosError(e)) {
                console.error("LNURL-AUTH FAIL:", e);
                const error = ((_d = (_c = e.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.reason) || e.message; // lnurl error or exception message
                pubsub_js_1.default.publish("lnurl.auth.failed", {
                    error,
                    lnurlDetails,
                    origin,
                });
                throw new Error(error);
            }
            else if (e instanceof Error) {
                pubsub_js_1.default.publish("lnurl.auth.failed", {
                    error: e.message,
                    lnurlDetails,
                    origin,
                });
                throw e;
            }
        }
    });
}
exports.authFunction = authFunction;
// see https://github.com/lnurl/luds/blob/luds/05.md
function getPathSuffix(domain, privateKeyHex) {
    const derivationMaterial = (0, hmac_sha256_1.default)(enc_utf8_1.default.parse(domain), enc_hex_1.default.parse(privateKeyHex)).toString(enc_hex_1.default);
    const buf = buffer_1.Buffer.from(derivationMaterial, "hex");
    const pathSuffix = [];
    for (let i = 0; i < 4; i++) {
        pathSuffix.push(buf.readUint32BE(i * 4));
    }
    return pathSuffix;
}
exports.getPathSuffix = getPathSuffix;
const auth = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const { lnurlDetails, origin } = message.args;
    const response = yield authFunction({ lnurlDetails, origin });
    return { data: response };
});
exports.default = auth;
