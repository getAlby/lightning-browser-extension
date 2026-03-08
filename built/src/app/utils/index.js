"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeNpubEncode = exports.extractLightningTagData = exports.isBitcoinAddress = exports.getAlbyAccountName = exports.isAlbyOAuthAccount = exports.isAlbyLNDHubAccount = exports.getBrowserType = exports.useTheme = exports.setTheme = exports.classNames = void 0;
const nostr_tools_1 = require("nostr-tools");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const api_1 = __importDefault(require("~/common/lib/api"));
function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}
exports.classNames = classNames;
/**
 * Get the active theme and apply corresponding Tailwind classes to the document.
 */
function setTheme() {
    api_1.default.getSettings().then((settings) => {
        // check if settings theme selection is system (this is the default)
        if (settings.theme === "system") {
            // checks if the users prefers dark mode and if true then adds dark class to HTML element
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                document.documentElement.classList.add("dark");
            }
            // if false removes dark class - there is no class by default but this is in case the user switches between themes
            else {
                document.documentElement.classList.remove("dark");
            }
        }
        // last two conditionals for if user selects light or dark mode
        else if (settings.theme === "dark") {
            document.documentElement.classList.add("dark");
        }
        else if (settings.theme === "light") {
            document.documentElement.classList.remove("dark");
        }
    });
}
exports.setTheme = setTheme;
function useTheme() {
    const { settings } = (0, SettingsContext_1.useSettings)();
    return settings.theme === "dark" ||
        (settings.theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light";
}
exports.useTheme = useTheme;
const DEFAULT_BROWSER = "chrome";
function getBrowserType() {
    if (!(chrome === null || chrome === void 0 ? void 0 : chrome.runtime))
        return DEFAULT_BROWSER;
    const url = chrome.runtime.getURL("");
    if (url.startsWith("moz-extension://"))
        return "firefox";
    if (url.startsWith("chrome-extension://"))
        return "chrome";
    return DEFAULT_BROWSER;
}
exports.getBrowserType = getBrowserType;
function isAlbyLNDHubAccount(alias = "", connectorType = "") {
    return alias === "🐝 getalby.com" && connectorType === "lndhub";
}
exports.isAlbyLNDHubAccount = isAlbyLNDHubAccount;
function isAlbyOAuthAccount(connectorType = "") {
    return connectorType === "alby";
}
exports.isAlbyOAuthAccount = isAlbyOAuthAccount;
function getAlbyAccountName(info) {
    // legacy accounts may not have either an email address or lightning address
    return info.email || info.lightning_address || "getalby.com";
}
exports.getAlbyAccountName = getAlbyAccountName;
// from https://stackoverflow.com/questions/21683680/regex-to-match-bitcoin-addresses + slightly modified to support testnet addresses
function isBitcoinAddress(address) {
    return /^(?:[13]{1}[a-km-zA-HJ-NP-Z1-9]{25,34}|(bc1|tb1)[a-z0-9]{39,59})$/i.test(address);
}
exports.isBitcoinAddress = isBitcoinAddress;
// to extract lightning data associated with the lightning tag within the URL. eg. LNBits QR codes
// look like this: https://lnbits.example.com?lightning=LNURL
function extractLightningTagData(url) {
    const reqExp = /lightning=([^&|\b]+)/i;
    const data = url.match(reqExp);
    if (data) {
        return data[1];
    }
    else {
        return url.replace(/^lightning:/i, "");
    }
}
exports.extractLightningTagData = extractLightningTagData;
function safeNpubEncode(hex) {
    try {
        return nostr_tools_1.nip19.npubEncode(hex);
    }
    catch (_a) {
        return undefined;
    }
}
exports.safeNpubEncode = safeNpubEncode;
