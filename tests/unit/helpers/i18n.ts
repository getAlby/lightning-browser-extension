import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "~/i18n/locales/en/translation.json";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  // debug: true,
  resources: { en },
});

export default i18n;
