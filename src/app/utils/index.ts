import { useSettings } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";
import { AlbyAccountInformation, BrowserType, Theme } from "~/types";

export function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Get the active theme and apply corresponding Tailwind classes to the document.
 */
export function setTheme() {
  api.getSettings().then((settings) => {
    // check if settings theme selection is system (this is the default)
    if (settings.theme === "system") {
      // checks if the users prefers dark mode and if true then adds dark class to HTML element
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
      // if false removes dark class - there is no class by default but this is in case the user switches between themes
      else {
        document.documentElement.classList.remove("dark");
      }
    }
    // last two conditionals for if user selects light or dark mode
    else if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (settings.theme === "light") {
      document.documentElement.classList.remove("dark");
    }
  });
}

export function useTheme(): Theme {
  const { settings } = useSettings();

  return settings.theme === "dark" ||
    (settings.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
    ? "dark"
    : "light";
}

const DEFAULT_BROWSER: BrowserType = "chrome";
export function getBrowserType(): BrowserType {
  if (!chrome?.runtime) return DEFAULT_BROWSER;
  const url = chrome.runtime.getURL("");
  if (url.startsWith("moz-extension://")) return "firefox";
  if (url.startsWith("chrome-extension://")) return "chrome";
  return DEFAULT_BROWSER;
}

export function isAlbyLNDHubAccount(alias = "", connector = "") {
  return alias === "🐝 getalby.com" && connector === "lndhub";
}
export function isAlbyOAuthAccount(connector = "") {
  return connector === "alby";
}

export function getAlbyAccountName(info: AlbyAccountInformation) {
  // legacy accounts may not have either an email address or lightning address
  return info.email || info.lightning_address || "getalby.com";
}
