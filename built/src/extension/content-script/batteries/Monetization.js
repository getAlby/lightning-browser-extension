"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const originData_1 = __importDefault(require("../originData"));
const helpers_1 = require("./helpers");
const urlMatcher = /^https?:\/\/.*/i;
const parseRecipient = (content) => {
    const tokens = content
        .split(";")
        .map((e) => e.trim())
        .filter((e) => !!e);
    const recipient = tokens.reduce((obj, tkn) => {
        const keyAndValue = tkn.split("=");
        const keyAndValueTrimmed = keyAndValue.map((e) => e.trim());
        return Object.assign(Object.assign({}, obj), { [keyAndValueTrimmed[0]]: keyAndValueTrimmed[1] });
    }, {});
    return recipient;
};
const battery = () => {
    const monetizationTag = document.querySelector('head > meta[name="lightning" i]');
    if (!monetizationTag) {
        return;
    }
    const content = monetizationTag.content;
    let recipient;
    // check for backwards compatibility: supports directly a lightning address or lnurlp:xxx
    if (content.match(/^lnurlp:/) || content.indexOf("=") === -1) {
        const lnAddress = monetizationTag.content.replace(/lnurlp:/i, "");
        recipient = {
            method: "lnurl",
            address: lnAddress,
        };
    }
    else {
        recipient = parseRecipient(content);
    }
    const metaData = (0, originData_1.default)();
    (0, helpers_1.setLightningData)([
        Object.assign(Object.assign({}, recipient), metaData),
    ]);
};
const Monetization = {
    urlMatcher,
    battery,
};
exports.default = Monetization;
