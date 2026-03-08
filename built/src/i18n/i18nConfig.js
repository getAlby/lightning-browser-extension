"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedLocales = exports.resources = exports.defaultNS = void 0;
// dayjs locales must be imported as well, list: https://github.com/iamkun/dayjs/tree/dev/src/locale
require("dayjs/locale/cs");
require("dayjs/locale/da");
require("dayjs/locale/es");
require("dayjs/locale/fa");
require("dayjs/locale/fi");
require("dayjs/locale/fr");
require("dayjs/locale/hi");
require("dayjs/locale/it");
require("dayjs/locale/mr");
require("dayjs/locale/pl");
require("dayjs/locale/pt-br");
require("dayjs/locale/ru");
require("dayjs/locale/si");
require("dayjs/locale/sv");
require("dayjs/locale/ta");
require("dayjs/locale/uk");
require("dayjs/locale/zh-cn");
const i18next_1 = __importDefault(require("i18next"));
const i18next_browser_languagedetector_1 = __importDefault(require("i18next-browser-languagedetector"));
const react_i18next_1 = require("react-i18next");
// import our translations
const translation_json_1 = __importDefault(require("~/i18n/locales/cs/translation.json"));
const translation_json_2 = __importDefault(require("~/i18n/locales/da/translation.json"));
const translation_json_3 = __importDefault(require("~/i18n/locales/de/translation.json"));
const translation_json_4 = __importDefault(require("~/i18n/locales/en/translation.json"));
const translation_json_5 = __importDefault(require("~/i18n/locales/es/translation.json"));
const translation_json_6 = __importDefault(require("~/i18n/locales/fa/translation.json"));
const translation_json_7 = __importDefault(require("~/i18n/locales/fr/translation.json"));
const translation_json_8 = __importDefault(require("~/i18n/locales/hi/translation.json"));
const translation_json_9 = __importDefault(require("~/i18n/locales/it/translation.json"));
const translation_json_10 = __importDefault(require("~/i18n/locales/mr/translation.json"));
const translation_json_11 = __importDefault(require("~/i18n/locales/pl/translation.json"));
const translation_json_12 = __importDefault(require("~/i18n/locales/pt_BR/translation.json"));
const translation_json_13 = __importDefault(require("~/i18n/locales/ru/translation.json"));
const translation_json_14 = __importDefault(require("~/i18n/locales/si/translation.json"));
const translation_json_15 = __importDefault(require("~/i18n/locales/sv/translation.json"));
const translation_json_16 = __importDefault(require("~/i18n/locales/ta/translation.json"));
const translation_json_17 = __importDefault(require("~/i18n/locales/th/translation.json"));
const translation_json_18 = __importDefault(require("~/i18n/locales/uk/translation.json"));
const translation_json_19 = __importDefault(require("~/i18n/locales/zh_Hans/translation.json"));
exports.defaultNS = "translation";
// needs to be aligned with `supportedLocales`
exports.resources = {
    en: {
        translation: translation_json_4.default.translation,
        common: translation_json_4.default.common,
        components: translation_json_4.default.components,
        permissions: translation_json_4.default.permissions,
    },
    cs: {
        translation: translation_json_1.default.translation,
        common: translation_json_1.default.common,
        components: translation_json_1.default.components,
        permissions: translation_json_1.default.permissions,
    },
    da: {
        translation: translation_json_2.default.translation,
        common: translation_json_2.default.common,
        components: translation_json_2.default.components,
        permissions: translation_json_2.default.permissions,
    },
    de: {
        translation: translation_json_3.default.translation,
        common: translation_json_3.default.common,
        components: translation_json_3.default.components,
        permissions: translation_json_3.default.permissions,
    },
    es: {
        translation: translation_json_5.default.translation,
        common: translation_json_5.default.common,
        components: translation_json_5.default.components,
        permissions: translation_json_5.default.permissions,
    },
    fr: {
        translation: translation_json_7.default.translation,
        common: translation_json_7.default.common,
        components: translation_json_7.default.components,
        permissions: translation_json_7.default.permissions,
    },
    it: {
        translation: translation_json_9.default.translation,
        common: translation_json_9.default.common,
        components: translation_json_9.default.components,
        permissions: translation_json_9.default.permissions,
    },
    hi: {
        translation: translation_json_8.default.translation,
        common: translation_json_8.default.common,
        components: translation_json_8.default.components,
        permissions: translation_json_8.default.permissions,
    },
    mr: {
        translation: translation_json_10.default.translation,
        common: translation_json_10.default.common,
        components: translation_json_10.default.components,
        permissions: translation_json_10.default.permissions,
    },
    pl: {
        translation: translation_json_11.default.translation,
        common: translation_json_11.default.common,
        components: translation_json_11.default.components,
        permissions: translation_json_11.default.permissions,
    },
    "pt-BR": {
        translation: translation_json_12.default.translation,
        common: translation_json_12.default.common,
        components: translation_json_12.default.components,
        permissions: translation_json_12.default.permissions,
    },
    sv: {
        translation: translation_json_15.default.translation,
        common: translation_json_15.default.common,
        components: translation_json_15.default.components,
        permissions: translation_json_15.default.permissions,
    },
    th: {
        translation: translation_json_17.default.translation,
        common: translation_json_17.default.common,
        components: translation_json_17.default.components,
        permissions: translation_json_17.default.permissions,
    },
    "zh-CN": {
        translation: translation_json_19.default.translation,
        common: translation_json_19.default.common,
        components: translation_json_19.default.components,
        permissions: translation_json_19.default.permissions,
    },
    fa: {
        translation: translation_json_6.default.translation,
        common: translation_json_6.default.common,
        components: translation_json_6.default.components,
        permissions: translation_json_6.default.permissions,
    },
    si: {
        translation: translation_json_14.default.translation,
        common: translation_json_14.default.common,
        components: translation_json_14.default.components,
        permissions: translation_json_14.default.permissions,
    },
    ta: {
        translation: translation_json_16.default.translation,
        common: translation_json_16.default.common,
        components: translation_json_16.default.components,
        permissions: translation_json_16.default.permissions,
    },
    ru: {
        translation: translation_json_13.default.translation,
        common: translation_json_13.default.common,
        components: translation_json_13.default.components,
        permissions: translation_json_13.default.permissions,
    },
    uk: {
        translation: translation_json_18.default.translation,
        common: translation_json_18.default.common,
        components: translation_json_18.default.components,
        permissions: translation_json_18.default.permissions,
    },
};
// needs to be aligned with `resources`
exports.supportedLocales = [
    { locale: "en", label: "English" },
    { locale: "cs", label: "Čeština" },
    { locale: "da", label: "Dansk" },
    { locale: "de", label: "Deutsch" },
    { locale: "es", label: "Español" },
    { locale: "fr", label: "Français" },
    { locale: "it", label: "Italiano" },
    { locale: "pl", label: "Polski" },
    { locale: "pt-BR", label: "Português (Brasil)" },
    { locale: "fi", label: "Suomalainen" },
    { locale: "sv", label: "Svenska" },
    { locale: "zh-CN", label: "中文（简化字）" },
    { locale: "hi", label: "हिंदी" },
    { locale: "mr", label: "मराठी" },
    { locale: "th", label: "ไทย" },
    { locale: "fa", label: "فارسی" },
    { locale: "si", label: "Sinhalese" },
    { locale: "ta", label: "Tamil" },
    { locale: "ru", label: "Russian" },
    { locale: "uk", label: "Ukrainian" },
];
i18next_1.default
    // pass the i18n instance to react-i18next.
    .use(react_i18next_1.initReactI18next)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(i18next_browser_languagedetector_1.default)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
    //debug: true,
    fallbackLng: "en",
    ns: ["translation", "common", "components", "permissions"],
    defaultNS: exports.defaultNS,
    resources: exports.resources,
});
exports.default = i18next_1.default;
