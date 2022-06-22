import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import type { CustomDetector } from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import api from "~/common/lib/api";

import en_common from "./locales/en/common.json";
import hi_common from "./locales/en/common.json";
import en_components from "./locales/en/components.json";
import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";

export const settings: CustomDetector = {
  name: "settings",

  lookup(_options) {
    let settingsLang;
    api.getSettings().then((setting) => {
      i18n.changeLanguage(setting.locale);
      settingsLang = setting.locale;
    });
    return settingsLang;
  },

  cacheUserLanguage(_lng, _options) {
    // lng -> current language, will be called after init and on changeLanguage
    // store it
    api.getSettings().then((setting) => {
      i18n.changeLanguage(setting.locale);
    });
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(settings);

// Load namespaces
export const resources = {
  en: {
    translation: en,
    common: en_common,
    components: en_components,
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
  .use(languageDetector)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    //debug: true,
    detection: {
      // order and from where user language should be detected
      order: [
        "settings",
        "querystring",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],
    },
    fallbackLng: "en",
    resources,
  });

export default i18n;
