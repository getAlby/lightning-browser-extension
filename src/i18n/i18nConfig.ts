import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/translation.json";
import en_common from "./locales/en/common.json";
import hi from "./locales/hi/translation.json";
import hi_common from "./locales/en/common.json";

// Load namespaces
export const resources = {
  en: {
    translation: en,
    common: en_common,
  },
  hi: {
    translation: hi,
    common: hi_common,
  },
};

i18n
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    //debug: true,
    fallbackLng: "en",
    resources,
  });

export default i18n;
