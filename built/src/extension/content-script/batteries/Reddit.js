"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const originData_1 = __importDefault(require("../originData"));
const helpers_1 = require("./helpers");
const urlMatcher = /https?:\/\/(?:www\.)?reddit\.com\/(?:u|user)\/([^/?#]+)\/?$/;
const battery = () => {
    var _a, _b, _c;
    // Reddit user profile extraction
    const bioSelectors = [
        "#profile--about-card p",
        "[data-testid='user-description']",
        ".ProfileSidebar__about",
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
    const name = ((_a = document.querySelector("h1")) === null || _a === void 0 ? void 0 : _a.innerText) ||
        ((_b = document.querySelector("[data-testid='user-name']")) === null || _b === void 0 ? void 0 : _b.innerText) ||
        "Reddit User";
    const icon = ((_c = document.querySelector("img[src*='avatar']")) === null || _c === void 0 ? void 0 : _c.getAttribute("src")) || "";
    (0, helpers_1.setLightningData)([
        Object.assign(Object.assign({ method: "lnurl", address: address }, (0, originData_1.default)()), { description: bioText.substring(0, 160), name: name, icon: icon }),
    ]);
};
const Reddit = {
    urlMatcher,
    battery,
};
exports.default = Reddit;
