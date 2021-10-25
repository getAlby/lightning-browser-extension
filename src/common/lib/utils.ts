import browser from "webextension-polyfill";
import qs from "query-string";
import shajs from "sha.js";
import PubSub from "pubsub-js";

const utils = {
  call: (
    type: string,
    args?: { [key: string]: any },
    overwrites?: { [key: string]: any }
  ) => {
    return browser.runtime
      .sendMessage({
        application: "LBE",
        prompt: true,
        type: type,
        args: args,
        origin: { internal: true },
        ...overwrites,
      })
      .then((response: { data: any; error?: string }) => {
        if (response.error) {
          throw new Error(response.error);
        }
        return response.data;
      });
  },
  notify: (options: { title: string; message: string }) => {
    const notification: browser.Notifications.CreateNotificationOptions = {
      type: "basic",
      iconUrl: "assets/icons/satsymbol-48.png",
      ...options,
    };

    return browser.notifications.create(notification);
  },
  getHash: (str: string) => {
    return shajs("sha256").update(str).digest("hex");
  },
  base64ToHex: (str: string) => {
    for (
      var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = [];
      i < bin.length;
      ++i
    ) {
      let tmp = bin.charCodeAt(i).toString(16);
      if (tmp.length === 1) tmp = "0" + tmp;
      hex[hex.length] = tmp;
    }
    return hex.join("");
  },
  bytesToHexString: (bytes: number[]) => {
    return Array.from(bytes, (byte) => {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");
  },
  bytesToString: (bytes: number[]) => {
    return String.fromCharCode.apply(null, bytes);
  },
  hexToUint8Array: (hexString: string) => {
    const match = hexString.match(/.{1,2}/g);
    if (match) {
      return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
    }
  },
  stringToUint8Array: (str: string) => {
    return Uint8Array.from(str, (x) => x.charCodeAt(0));
  },
  publishPaymentNotification: (message, paymentRequestDetails, response) => {
    let status = "success"; // default. let's hope for success
    if (response.error || (response.data && response.data.payment_error)) {
      status = "failed";
    }
    PubSub.publish(`ln.sendPayment.${status}`, {
      response,
      paymentRequestDetails,
      origin: message.origin,
    });
  },
  openPage: (page: string) => {
    browser.tabs.create({ url: browser.runtime.getURL(page) });
  },
  openUrl: (url: string) => {
    browser.tabs.create({ url });
  },
  openPrompt: (message) => {
    const urlParams = qs.stringify({
      args: JSON.stringify(message.args),
      origin: JSON.stringify(message.origin),
      type: message.type,
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

          const onMessageListener = (responseMessage, sender) => {
            if (
              responseMessage &&
              responseMessage.response &&
              sender.tab &&
              sender.tab.id === tabId
            ) {
              browser.tabs.onRemoved.removeListener(onRemovedListener);
              return browser.windows.remove(sender.tab.windowId).then(() => {
                if (responseMessage.error) {
                  return reject(new Error(responseMessage.error));
                } else {
                  return resolve(responseMessage);
                }
              });
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
