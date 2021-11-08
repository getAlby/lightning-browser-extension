import browser from "webextension-polyfill";

const setIcon = async (message, sender) => {
  // TODO: refactor names / rename files?
  const names = {
    active: "satsymbol",
    off: "satsymbol-black",
  };
  const name = names[message.args.icon];
  return browser.browserAction
    .setIcon({
      path: {
        16: `assets/icons/${name}-16.png`,
        32: `assets/icons/${name}-32.png`,
        48: `assets/icons/${name}-48.png`,
        128: `assets/icons/${name}-128.png`,
      },
      tabId: sender.tab.id,
    })
    .then(() => {
      return {
        data: true,
      };
    });
};

export default setIcon;
