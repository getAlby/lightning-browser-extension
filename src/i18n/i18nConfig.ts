// dayjs locales must be imported as well, list: https://github.com/iamkun/dayjs/tree/dev/src/locale
import "dayjs/locale/cs";
import "dayjs/locale/da";
import "dayjs/locale/es";
import "dayjs/locale/fa";
import "dayjs/locale/fi";
import "dayjs/locale/fr";
import "dayjs/locale/hi";
import "dayjs/locale/it";
import "dayjs/locale/mr";
import "dayjs/locale/pl";
import "dayjs/locale/pt-br";
import "dayjs/locale/ru";
import "dayjs/locale/si";
import "dayjs/locale/sv";
import "dayjs/locale/ta";
import "dayjs/locale/zh-cn";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
// import our translations
import cs from "~/i18n/locales/cs/translation.json";
import da from "~/i18n/locales/da/translation.json";
import de from "~/i18n/locales/de/translation.json";
import en from "~/i18n/locales/en/translation.json";
import es from "~/i18n/locales/es/translation.json";
import fa from "~/i18n/locales/fa/translation.json";
import fr from "~/i18n/locales/fr/translation.json";
import hi from "~/i18n/locales/hi/translation.json";
import it from "~/i18n/locales/it/translation.json";
import mr from "~/i18n/locales/mr/translation.json";
import pl from "~/i18n/locales/pl/translation.json";
import pt_BR from "~/i18n/locales/pt_BR/translation.json";
import ru from "~/i18n/locales/ru/translation.json";
import si from "~/i18n/locales/si/translation.json";
import sv from "~/i18n/locales/sv/translation.json";
import ta from "~/i18n/locales/ta/translation.json";
import th from "~/i18n/locales/th/translation.json";
import zh_Hans from "~/i18n/locales/zh_Hans/translation.json";

export const defaultNS = "translation";
// needs to be aligned with `supportedLocales`
export const resources = {
  en: {
    translation: en.translation,
    common: en.common,
    components: en.components,
    permissions: en.permissions,
  },
  cs: {
    translation: cs.translation,
    common: cs.common,
    components: cs.components,
    permissions: cs.permissions,
  },
  da: {
    translation: da.translation,
    common: da.common,
    components: da.components,
    permissions: da.permissions,
  },
  de: {
    translation: de.translation,
    common: de.common,
    components: de.components,
    permissions: de.permissions,
  },
  es: {
    translation: es.translation,
    common: es.common,
    components: es.components,
    permissions: es.permissions,
  },
  fr: {
    translation: fr.translation,
    common: fr.common,
    components: fr.components,
    permissions: fr.permissions,
  },
  it: {
    translation: it.translation,
    common: it.common,
    components: it.components,
    permissions: it.permissions,
  },
  hi: {
    translation: hi.translation,
    common: hi.common,
    components: hi.components,
    permissions: hi.permissions,
  },
  mr: {
    translation: mr.translation,
    common: mr.common,
    components: mr.components,
    permissions: mr.permissions,
  },
  pl: {
    translation: pl.translation,
    common: pl.common,
    components: pl.components,
    permissions: pl.permissions,
  },
  "pt-BR": {
    translation: pt_BR.translation,
    common: pt_BR.common,
    components: pt_BR.components,
    permissions: pt_BR.permissions,
  },
  sv: {
    translation: sv.translation,
    common: sv.common,
    components: sv.components,
    permissions: sv.permissions,
  },
  th: {
    translation: th.translation,
    common: th.common,
    components: th.components,
    permissions: th.permissions,
  },
  "zh-CN": {
    translation: zh_Hans.translation,
    common: zh_Hans.common,
    components: zh_Hans.components,
    permissions: zh_Hans.permissions,
  },
  fa: {
    translation: fa.translation,
    common: fa.common,
    components: fa.components,
    permissions: fa.permissions,
  },
  si: {
    translation: si.translation,
    common: si.common,
    components: si.components,
    permissions: si.permissions,
  },
  ta: {
    translation: ta.translation,
    common: ta.common,
    components: ta.components,
    permissions: ta.permissions,
  },
  ru: {
    translation: ru.translation,
    common: ru.common,
    components: ru.components,
    permissions: ru.permissions,
  },
} as const;

// needs to be aligned with `resources`
export const supportedLocales = [
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
];

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
    ns: ["translation", "common", "components", "permissions"],
    defaultNS,
    resources,
  });

export default i18n;
