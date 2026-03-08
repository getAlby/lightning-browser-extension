"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const originData_1 = __importDefault(require("../originData"));
const helpers_1 = require("./helpers");
const urlMatcher = /^https?:\/\/(?:[^/]+\.)?medium\.com\/@([^/?#]+)\/?(?:\?.*)?(?:#.*)?$/;
const battery = () => {
    var _a, _b, _c, _d, _e;
    // 1. Search for Lightning addresses in the bio (more robust approach)
    // We search for elements that typically contain the bio
    const bioSelectors = [
        '[data-testid="authorBio"]',
        'meta[name="description"]',
    ];
    let address = null;
    let finalBioText = "";
    for (const selector of bioSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            const bioText = element instanceof HTMLMetaElement
                ? element.content
                : element.innerText;
            if (bioText) {
                address = (0, helpers_1.findLightningAddressInText)(bioText);
                if (address) {
                    finalBioText = bioText;
                    break;
                }
            }
        }
    }
    if (!address)
        return;
    // 2. Extract name and icon (robust via og-tags)
    const name = ((_b = (_a = document
        .querySelector('meta[property="og:title"]')) === null || _a === void 0 ? void 0 : _a.getAttribute("content")) === null || _b === void 0 ? void 0 : _b.split(" – ")[0]) ||
        ((_c = document.querySelector("h1")) === null || _c === void 0 ? void 0 : _c.innerText) ||
        "Medium Author";
    const icon = ((_d = document
        .querySelector('meta[property="og:image"]')) === null || _d === void 0 ? void 0 : _d.getAttribute("content")) ||
        ((_e = document.querySelector('img[src*="/profile/"]')) === null || _e === void 0 ? void 0 : _e.getAttribute("src")) ||
        "";
    (0, helpers_1.setLightningData)([
        Object.assign(Object.assign({ method: "lnurl", address: address }, (0, originData_1.default)()), { description: finalBioText.substring(0, 160), name: name, icon: icon }),
    ]);
};
const Medium = {
    urlMatcher,
    battery,
};
exports.default = Medium;
