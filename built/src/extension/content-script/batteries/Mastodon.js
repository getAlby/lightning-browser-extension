"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const originData_1 = __importDefault(require("../originData"));
const helpers_1 = require("./helpers");
const urlMatcher = /^https?:\/\/[^/]+\/@[^/@]+(?:\/)?(?:\?.*)?(?:#.*)?$/;
const battery = () => {
    var _a, _b, _c, _d;
    // Mastodon profile extraction (robust selector for bio)
    const bioSelectors = [
        ".p-note",
        ".account__header__content",
        ".public-account-bio",
    ];
    let bioText = "";
    for (const selector of bioSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            bioText = element.innerText;
            if (bioText)
                break;
        }
    }
    const address = (0, helpers_1.findLightningAddressInText)(bioText);
    if (!address)
        return;
    const name = ((_a = document.querySelector(".p-name")) === null || _a === void 0 ? void 0 : _a.innerText) ||
        ((_b = document.querySelector(".account__header__tabs__name")) === null || _b === void 0 ? void 0 : _b.innerText) ||
        "Mastodon User";
    const icon = ((_c = document.querySelector(".u-photo")) === null || _c === void 0 ? void 0 : _c.src) ||
        ((_d = document.querySelector(".account__header__avatar img")) === null || _d === void 0 ? void 0 : _d.src) ||
        "";
    (0, helpers_1.setLightningData)([
        Object.assign(Object.assign({ method: "lnurl", address: address }, (0, originData_1.default)()), { description: bioText.substring(0, 160), name: name, icon: icon }),
    ]);
};
const Mastodon = {
    urlMatcher,
    battery,
};
exports.default = Mastodon;
