import { useSettings } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";
import { BrowserType, Theme } from "~/types";

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

export function isAlbyAccount(alias = "") {
  return alias === "🐝 getalby.com";
}

export async function getAlbyWalletOptions() {
  try {
    const walletRootUrl =
      process.env.WALLET_ROOT_URL || "https://app.regtest.getalby.com";
    const VERSION = process.env.VERSION || "unknown"; // default is mainly that TS is happy
    const walletOptionsUrl = `${walletRootUrl}/extension/options`;
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("X-User-Agent", "alby-extension");
    headers.append("X-Alby-Version", VERSION);
    const timestamp = Math.floor(Date.now() / 1000);
    headers.append("X-TS", timestamp.toString());

    const response = await fetch(walletOptionsUrl, {
      method: "GET",
      headers: headers,
      cache: "no-cache",
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}

// to extract lightning data associated with the lightning tag within the URL. eg. LNBits QR codes
export function extractLightningTagData(url: string) {
  const reqExp = /lightning=([^&|\b]+)/i;

  const data = url.match(reqExp);

  if (data) {
    return data[1];
  } else {
    return url.replace(/^lightning:/i, "");
  }
}
