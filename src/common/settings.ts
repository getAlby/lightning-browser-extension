import i18n from "~/i18n/i18nConfig";
import type { SettingsStorage } from "~/types";

import { CURRENCIES } from "./constants";

export const DEFAULT_SETTINGS: SettingsStorage = {
  browserNotifications: true,
  websiteEnhancements: true,
  userName: "",
  userEmail: "",
  locale: i18n.resolvedLanguage ?? "en",
  theme: "system",
  showFiat: true,
  currency: CURRENCIES.USD,
  exchange: "alby",
  nostrEnabled: false,
};
