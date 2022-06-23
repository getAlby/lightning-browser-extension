import browser from "webextension-polyfill";
import state from "../../state";

const icons = [];

const setIcon = async (message, sender) => {

  // TODO: refactor names / rename files?
  const names = {
    active: "alby_icon_green",
    available: "alby_icon_blue",
    default: "alby_icon_yellow",
  };

  icons[sender.tab.id.toString()] = message.args.icon;

  let name = names[message.args.icon];

  console.log("backgroundScript: setIcon", icons[sender.tab.id.toString()] , icons[sender.tab.id.toString()],  message.args.icon );

  if(icons[sender.tab.id.toString()] 
      && icons[sender.tab.id.toString()] == names.active
      && message.args.icon == names.available) {
      name = names.active;
      console.log("overwrite icon");
  }

  console.log(icons);

  const theme = state.getState().settings.theme == "dark" ? "_dark" : "";

  return browser.browserAction
    .setIcon({
      path: {
        16: `assets/icons/${name}${theme}_16x16.png`,
        32: `assets/icons/${name}${theme}_32x32.png`,
        48: `assets/icons/${name}${theme}_48x48.png`,
        128: `assets/icons/${name}${theme}_128x128.png`,
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
