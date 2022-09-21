import "dayjs/locale/es";
import "dayjs/locale/pt-br";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "~/i18n/locales/en/translation.json";
import es from "~/i18n/locales/es/translation.json";
import pt_BR from "~/i18n/locales/pt_BR/translation.json";

// needs to be aligned with `LocaleSwitcher.tsx`
export const resources = {
  en,
  es,
  pt_BR,
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
