import state from "../../state";

const highlightIcon = async (message, sender) => {
  console.log(message);
  console.log(sender);
  return browser.browserAction.setIcon({
    path: {
      16: "assets/icons/satsymbol-16.png",
      32: "assets/icons/satsymbol-32.png",
      48: "assets/icons/satsymbol-48.png",
      128: "assets/icons/satsymbol-128.png",
    },
    tabId: sender.tab.id,
  });
};

export default highlightIcon;
