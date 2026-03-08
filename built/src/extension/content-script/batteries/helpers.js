"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLightningAddressInText = exports.setLightningData = void 0;
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const lnurl_1 = __importDefault(require("~/common/lib/lnurl"));
const msg_1 = __importDefault(require("~/common/lib/msg"));
// duplicate also in setup/setIcon action
var ExtensionIcon;
(function (ExtensionIcon) {
    ExtensionIcon["Default"] = "alby_icon_yellow";
    ExtensionIcon["Tipping"] = "alby_icon_blue";
    ExtensionIcon["Active"] = "alby_icon_green";
})(ExtensionIcon || (ExtensionIcon = {}));
const setLightningData = (data) => {
    webextension_polyfill_1.default.runtime.sendMessage({
        application: "LBE",
        action: "lightningData",
        args: data,
    });
    msg_1.default.request("setIcon", { icon: ExtensionIcon.Tipping });
};
exports.setLightningData = setLightningData;
const findLightningAddressInText = (text) => {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (match && lnurl_1.default.isLightningAddress(match[0])) {
        return match[0];
    }
    return null;
};
exports.findLightningAddressInText = findLightningAddressInText;
