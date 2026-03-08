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
exports.setIconMessageHandler = exports.setIcon = exports.ExtensionIcon = void 0;
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const mv3_1 = require("~/common/utils/mv3");
// Store all tabs with their respective icon
const tabIcons = new Map();
// duplicate also in batteries/helper
var ExtensionIcon;
(function (ExtensionIcon) {
    ExtensionIcon["Default"] = "alby_icon_yellow";
    ExtensionIcon["Tipping"] = "alby_icon_blue";
    ExtensionIcon["Active"] = "alby_icon_green";
})(ExtensionIcon || (exports.ExtensionIcon = ExtensionIcon = {}));
const setIconMessageHandler = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Under some circumstances a Tab may not be assigned an ID
    if (!((_a = sender.tab) === null || _a === void 0 ? void 0 : _a.id)) {
        return Promise.resolve({
            data: false,
        });
    }
    yield setIcon(message.args.icon, sender.tab.id);
    return Promise.resolve({
        data: true,
    });
});
exports.setIconMessageHandler = setIconMessageHandler;
const setIcon = (icon, tabId) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const currentIcon = tabIcons.get(tabId);
    // The active icon has priority over tipping
    if (currentIcon &&
        currentIcon === ExtensionIcon.Active &&
        icon === ExtensionIcon.Tipping) {
        return Promise.resolve();
    }
    tabIcons.set(tabId, icon);
    // For Chrome (Manifest V3): Use browser theme (prefers-color-scheme)
    // For Firefox (Manifest V2): theme_icons in manifest.json handles OS-based icons automatically
    let theme = "";
    if (mv3_1.isManifestV3) {
        try {
            const results = yield webextension_polyfill_1.default.scripting.executeScript({
                target: { tabId },
                func: () => {
                    return window.matchMedia &&
                        window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "dark"
                        : "light";
                },
            });
            theme = ((_b = results[0]) === null || _b === void 0 ? void 0 : _b.result) === "dark" ? "_dark" : "";
        }
        catch (error) {
            console.warn("Failed to detect browser theme, using default:", error);
            theme = "";
        }
    }
    const iconsParams = {
        path: {
            // it's looking relative from the "js" folder
            16: `../assets/icons/${icon}${theme}_16x16.png`,
            32: `../assets/icons/${icon}${theme}_32x32.png`,
            48: `../assets/icons/${icon}${theme}_48x48.png`,
            128: `../assets/icons/${icon}${theme}_128x128.png`,
        },
        tabId,
    };
    return mv3_1.isManifestV3
        ? webextension_polyfill_1.default.action.setIcon(iconsParams)
        : webextension_polyfill_1.default.browserAction.setIcon(iconsParams);
});
exports.setIcon = setIcon;
