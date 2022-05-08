import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import api from "~/common/lib/api";

export const settings = {
  name: "settings",

  lookup(options) {
    // options -> are passed in options
    api.getSettings().then((setting) => {
      i18n.changeLanguage(setting.locale);
    });
  },

  cacheUserLanguage(lng, options) {
    // options -> are passed in options
    // lng -> current language, will be called after init and on changeLanguage
    // store it
    api.getSettings().then((setting) => {
      i18n.changeLanguage(setting.locale);
    });
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(settings);

export const resources = {
  en,
  hi,
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
