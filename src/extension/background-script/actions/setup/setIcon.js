import browser from "webextension-polyfill";

import state from "../../state";

const extensionIcons = {
  active: "alby_icon_green",
  tipping: "alby_icon_blue",
  default: "alby_icon_yellow",
};

const setIconMessageHandler = async (message, sender) => {
  // console.log("setIconMessageHandler()", message.args.icon, extensionIcons[message.args.icon], extensionIcons );

  await setIcon(message.args.icon, sender.tab.id);

  return new Promise().then(() => {
    return {
      data: true,
    };
  });
};

const icons = [];

const setIcon = async (icon, tabId) => {
  let currentIcon = icons[tabId] ?? null;

  // Ignore subsequent events
  if (
    currentIcon &&
    currentIcon == extensionIcons.active &&
    icon == extensionIcons.tipping
  ) {
    // console.log("ignoring new icon", tabId, icons);
    return Promise.resolve();
  }

  icons[tabId] = icon;

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
