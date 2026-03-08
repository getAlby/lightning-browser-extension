"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const i18nConfig_1 = __importStar(require("~/i18n/i18nConfig"));
function LocaleSwitcher({ className }) {
    var _a;
    const { settings, updateSetting } = (0, SettingsContext_1.useSettings)();
    const fallbackLng = (_a = i18nConfig_1.default.options.fallbackLng) === null || _a === void 0 ? void 0 : _a[0];
    const [dropdownLang, setDropdownLang] = (0, react_1.useState)(i18nConfig_1.default.language || fallbackLng);
    // loading settings can be slow, make sure that settings win
    (0, react_1.useEffect)(() => {
        if (dropdownLang !== settings.locale) {
            setDropdownLang(settings.locale);
        }
    }, [dropdownLang, settings.locale]);
    const languageHandler = (event) => __awaiter(this, void 0, void 0, function* () {
        const newLanguage = event.target.value;
        if (dropdownLang !== newLanguage) {
            setDropdownLang(newLanguage);
            updateSetting({ locale: newLanguage });
        }
    });
    return ((0, jsx_runtime_1.jsx)("select", { name: "locale", value: dropdownLang, onChange: languageHandler, className: className, children: i18nConfig_1.supportedLocales.map((locale) => ((0, jsx_runtime_1.jsx)("option", { value: locale.locale, children: locale.label }, locale.locale))) }));
}
exports.default = LocaleSwitcher;
