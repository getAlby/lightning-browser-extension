import browser from "webextension-polyfill";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";
import injectScript from "./injectScript";

//import { enhancements, loadEnhancements } from "../inpage-script/enhancements";
import extractLightningData from "./batteries";

if (shouldInject()) {
  injectScript();

  // extract LN data from websites
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "extractLightningData") {
      extractLightningData();
    }
  });

  // message listener to listen to inpage webln calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make webln availabe to the page)
  window.addEventListener("message", (ev) => {
    // Only accept messages from the current window
    if (ev.source !== window) {
      return;
    }
    if (ev.data && ev.data.application === "LBE" && !ev.data.response) {
      const messageWithOrigin = {
        ...ev.data,
        origin: getOriginData(),
      };
      const replyFunction = (response) => {
        window.postMessage(
          {
            application: "LBE",
            response: true,
            data: response,
          },
          "*" // TODO use origin
        );
      };
      return browser.runtime
        .sendMessage(messageWithOrigin)
        .then(replyFunction)
        .catch(replyFunction);
    }
  });
}
export {};
