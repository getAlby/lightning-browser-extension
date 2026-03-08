"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const react_i18next_1 = require("react-i18next");
const translation_json_1 = __importDefault(require("~/i18n/locales/en/translation.json"));
i18next_1.default.use(react_i18next_1.initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    // debug: true,
    resources: { en: translation_json_1.default },
});
exports.default = i18next_1.default;
