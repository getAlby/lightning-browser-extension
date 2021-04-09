import browser from "webextension-polyfill";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";
import injectScript from "./injectScript";

if (shouldInject()) {
  injectScript();

  // message listener to listen to inpage webln calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make webln availabe to the page)
  window.addEventListener("message", (ev) => {
    console.log("content script", ev.data);
    // Only accept messages from the current window
    if (ev.source !== window) {
      return;
    }
    if (ev.data && ev.data.application === "Joule" && !ev.data.response) {
      const messageWithOrigin = {
        ...ev.data,
        origin: getOriginData(),
      };
      const replyFunction = (response) => {
        window.postMessage(
          {
            application: "Joule",
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
