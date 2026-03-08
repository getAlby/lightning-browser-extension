"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = void 0;
const i18nConfig_1 = __importDefault(require("~/i18n/i18nConfig"));
const constants_1 = require("./constants");
exports.DEFAULT_SETTINGS = {
    browserNotifications: true,
    websiteEnhancements: true,
    userName: "",
    userEmail: "",
    locale: (_a = i18nConfig_1.default.resolvedLanguage) !== null && _a !== void 0 ? _a : "en",
    theme: "system",
    showFiat: true,
    currency: constants_1.CURRENCIES.USD,
    exchange: "alby",
    nostrEnabled: false,
};
