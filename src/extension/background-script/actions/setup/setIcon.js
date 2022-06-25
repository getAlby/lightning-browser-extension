import browser from "webextension-polyfill";

import state from "../../state";

const tabIcons = new Map();

const extensionIcons = {
  active: "alby_icon_green",
  tipping: "alby_icon_blue",
  default: "alby_icon_yellow",
};

const setIconMessageHandler = async (message, sender) => {
  await setIcon(message.args.icon, sender.tab.id);

  return new Promise().then(() => {
    return {
      data: true,
    };
  });
};

const setIcon = async (icon, tabId) => {
  let currentIcon = tabIcons.get(tabId);

  // The active icon has priority over tipping
  if (
    currentIcon &&
    currentIcon == extensionIcons.active &&
    icon == extensionIcons.tipping
  ) {
    return Promise.resolve();
  }

  tabIcons.set(tabId, icon);

  const theme = state.getState().settings.theme == "dark" ? "_dark" : "";

  return browser.browserAction.setIcon({
    path: {
      16: `assets/icons/${icon}${theme}_16x16.png`,
      32: `assets/icons/${icon}${theme}_32x32.png`,
      48: `assets/icons/${icon}${theme}_48x48.png`,
      128: `assets/icons/${icon}${theme}_128x128.png`,
    },
    tabId: tabId,
  });
};

export { setIcon, setIconMessageHandler, extensionIcons };
