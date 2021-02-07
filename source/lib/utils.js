import browser from "webextension-polyfill";
import qs from "query-string";

const utils = {
  call: (type, args) => {
    return browser.runtime
      .sendMessage({
        application: "Joule",
        prompt: true,
        type: type,
        args: args,
        origin: { internal: true },
      })
      .then((response) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.data;
      });
  },
  notify: (details) => {
    const notification = Object.assign(
      {
        type: "basic",
        iconUrl: browser.extension.getURL("assets/icons/favicon-48.png"),
      },
      details
    );
    browser.notifications.create(notification);
  },
  openPage: (page) => {
    browser.tabs.create({ url: browser.runtime.getURL(page) });
  },
  openUrl: (url) => {
    browser.tabs.create({ url });
  },
  openPrompt: (message) => {
    const urlParams = qs.stringify({
      args: JSON.stringify(message.args),
      origin: JSON.stringify(message.origin),
    });

    return new Promise((resolve, reject) => {
      browser.windows
        .create({
          url: `${browser.runtime.getURL("prompt.html")}?${urlParams}`,
          type: "popup",
          width: 400,
          height: 580,
        })
        .then((window) => {
          const tabId = window.tabs[0].id;

          const onMessageListener = (message, sender) => {
            if (
              message &&
              message.response &&
              sender.tab &&
              sender.tab.id === tabId
            ) {
              browser.tabs.onRemoved.removeListener(onRemovedListener);
              if (message.error) {
                reject(new Error(message.error));
              } else {
                resolve(message);
              }
              browser.windows.remove(sender.tab.windowId);
            }
          };

          const onRemovedListener = (tid) => {
            if (tabId === tid) {
              browser.runtime.onMessage.removeListener(onMessageListener);
              reject(new Error("Prompt was closed"));
            }
          };

          browser.runtime.onMessage.addListener(onMessageListener);
          browser.tabs.onRemoved.addListener(onRemovedListener);
        });
    });
  },
};

export default utils;
