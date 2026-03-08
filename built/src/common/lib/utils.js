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
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const constants_1 = require("~/common/constants");
const string_1 = require("~/common/lib/string");
const window_1 = require("../utils/window");
const utils = {
    base64ToHex: (str) => {
        const hex = [];
        for (let i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")); i < bin.length; ++i) {
            let tmp = bin.charCodeAt(i).toString(16);
            if (tmp.length === 1)
                tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join("");
    },
    urlSafeBase64ToHex: (str) => {
        return utils.base64ToHex(str.replace(/_/g, "/").replace(/-/g, "+"));
    },
    bytesToHexString: (bytes) => {
        return Array.from(bytes, (byte) => {
            return ("0" + (byte & 0xff).toString(16)).slice(-2);
        }).join("");
    },
    bytesToString: (bytes) => {
        return String.fromCharCode.apply(null, bytes);
    },
    hexToUint8Array: (hexString) => {
        const match = hexString.match(/.{1,2}/g);
        if (match) {
            return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
        }
    },
    stringToUint8Array: (str) => {
        return Uint8Array.from(str, (x) => x.charCodeAt(0));
    },
    deferredPromise: () => {
        let resolve;
        let reject;
        const promise = new Promise((innerResolve, innerReject) => {
            resolve = innerResolve;
            reject = innerReject;
        });
        return { promise, resolve, reject };
    },
    openPage: (page) => {
        webextension_polyfill_1.default.tabs.create({ url: webextension_polyfill_1.default.runtime.getURL(page) });
    },
    redirectPage: (page) => {
        webextension_polyfill_1.default.tabs.update({ url: webextension_polyfill_1.default.runtime.getURL(page) });
    },
    openUrl: (url) => {
        webextension_polyfill_1.default.tabs.create({ url });
    },
    openPrompt: (message) => __awaiter(void 0, void 0, void 0, function* () {
        const urlParams = new URLSearchParams();
        // passing on the message args to the prompt if present
        if (message.args) {
            urlParams.set("args", JSON.stringify(message.args));
        }
        // passing on the message origin to the prompt if present
        if (message.origin) {
            urlParams.set("origin", JSON.stringify(message.origin));
        }
        // action must always be present, this is used to route the request
        urlParams.set("action", message.action);
        const url = `${webextension_polyfill_1.default.runtime.getURL("prompt.html")}?${urlParams.toString()}`;
        // Window APIs might not be available on mobile browsers
        // on iOS window APIs are available, but `windows.create` is not
        const useWindow = !!(webextension_polyfill_1.default.windows && webextension_polyfill_1.default.windows.create);
        // Either API yields a tabId
        const tabId = useWindow
            ? yield (0, window_1.createPromptWindow)(url)
            : yield (0, window_1.createPromptTab)(url);
        return new Promise((resolve, reject) => {
            const onMessageListener = (responseMessage, sender) => {
                if (responseMessage &&
                    responseMessage.response &&
                    sender.tab &&
                    sender.tab.id === tabId &&
                    sender.tab.windowId) {
                    // Remove the event listener as we are about to close the tab
                    webextension_polyfill_1.default.tabs.onRemoved.removeListener(onRemovedListener);
                    // Use window APIs for removing the window as Opera doesn't
                    // close the window if you remove the last tab (e.g. in popups)
                    let closePromise;
                    if (useWindow) {
                        closePromise = webextension_polyfill_1.default.windows.remove(sender.tab.windowId);
                    }
                    else {
                        closePromise = webextension_polyfill_1.default.tabs.remove(tabId);
                    }
                    return closePromise.then(() => {
                        // in the future actual "remove" (closing prompt) will be moved to component for i.e. budget flow
                        // https://github.com/getAlby/lightning-browser-extension/issues/1197
                        if (responseMessage.error) {
                            return reject(new Error(responseMessage.error));
                        }
                        else {
                            return resolve(responseMessage);
                        }
                    });
                }
            };
            const onRemovedListener = (tid) => {
                if (tabId === tid) {
                    webextension_polyfill_1.default.runtime.onMessage.removeListener(onMessageListener);
                    reject(new Error(constants_1.ABORT_PROMPT_ERROR));
                }
            };
            webextension_polyfill_1.default.runtime.onMessage.addListener(onMessageListener);
            webextension_polyfill_1.default.tabs.onRemoved.addListener(onRemovedListener);
        });
    }),
    getBoostagramFromInvoiceCustomRecords: (custom_records) => {
        try {
            let boostagramDecoded;
            const boostagram = custom_records === null || custom_records === void 0 ? void 0 : custom_records[7629169];
            if (boostagram) {
                boostagramDecoded = (0, string_1.base64DecodeUnicode)(boostagram);
            }
            return boostagramDecoded ? JSON.parse(boostagramDecoded) : undefined;
        }
        catch (e) {
            console.error(e);
            return;
        }
    },
};
exports.default = utils;
