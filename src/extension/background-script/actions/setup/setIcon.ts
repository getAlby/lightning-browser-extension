import browser, { Runtime } from "webextension-polyfill";
import { isManifestV3 } from "~/common/utils/mv3";
import { MessageSetIcon } from "~/types";

// Store all tabs with their respective icon
const tabIcons = new Map<number, string>();

// duplicate also in batteries/helper
enum ExtensionIcon {
  Default = "alby_icon_yellow",
  Tipping = "alby_icon_blue",
  Active = "alby_icon_green",
}

const setIconMessageHandler = async (
  message: MessageSetIcon,
  sender: Runtime.MessageSender
): Promise<{ data: boolean }> => {
  // Under some circumstances a Tab may not be assigned an ID
  if (!sender.tab?.id) {
    return Promise.resolve({
      data: false,
    });
  }

  await setIcon(message.args.icon, sender.tab.id);

  return Promise.resolve({
    data: true,
  });
};

const setIcon = async (icon: string, tabId: number): Promise<void> => {
  const currentIcon = tabIcons.get(tabId);

  // The active icon has priority over tipping
  if (
    currentIcon &&
    currentIcon === ExtensionIcon.Active &&
    icon === ExtensionIcon.Tipping
  ) {
    return Promise.resolve();
  }

  tabIcons.set(tabId, icon);

  // For Chrome (Manifest V3): Use browser theme (prefers-color-scheme)
  // For Firefox (Manifest V2): theme_icons in manifest.json handles OS-based icons automatically
  let theme = "";
  if (isManifestV3) {
    try {
      const results = await browser.scripting.executeScript({
        target: { tabId },
        func: () => {
          return window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        },
      });
      theme = results[0]?.result === "dark" ? "_dark" : "";
    } catch (error) {
      console.warn("Failed to detect browser theme, using default:", error);
      theme = "";
    }
  }

  const iconsParams = {
    path: {
      // it's looking relative from the "js" folder
      16: `../assets/icons/${icon}${theme}_16x16.png`,
      32: `../assets/icons/${icon}${theme}_32x32.png`,
      48: `../assets/icons/${icon}${theme}_48x48.png`,
      128: `../assets/icons/${icon}${theme}_128x128.png`,
    },
    tabId,
  };

  return isManifestV3
    ? browser.action.setIcon(iconsParams)
    : browser.browserAction.setIcon(iconsParams);
};

export { ExtensionIcon, setIcon, setIconMessageHandler };
