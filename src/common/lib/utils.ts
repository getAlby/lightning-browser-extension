import PubSub from "pubsub-js";
import { toast } from "react-toastify";
import browser, { Runtime } from "webextension-polyfill";
import { ABORT_PROMPT_ERROR } from "~/common/constants";
import {
  Message,
  OriginData,
  OriginDataInternal,
  PaymentNotificationData,
} from "~/types";

const utils = {
  call: <T = Record<string, unknown>>(
    action: string,
    args?: Record<string, unknown>,
    overwrites?: Record<string, unknown>
  ) => {
    return browser.runtime
      .sendMessage({
        application: "LBE",
        prompt: true,
        action: action,
        args: args,
        origin: { internal: true },
        ...overwrites,
      })
      .then((response: { data: T; error?: string }) => {
        if (response.error) {
          toast.error(response.error);
          throw new Error(response.error);
        }
        return response.data;
      });
  },
  notify: (options: { title: string; message: string }) => {
    const notification: browser.Notifications.CreateNotificationOptions = {
      type: "basic",
      iconUrl: "assets/icons/alby_icon_yellow_48x48.png",
      ...options,
    };

    return browser.notifications.create(notification);
  },
  base64ToHex: (str: string) => {
    const hex = [];
    for (
      let i = 0, bin = atob(str.replace(/[ \r\n]+$/, ""));
      i < bin.length;
      ++i
    ) {
      let tmp = bin.charCodeAt(i).toString(16);
      if (tmp.length === 1) tmp = "0" + tmp;
      hex[hex.length] = tmp;
    }
    return hex.join("");
  },
  urlSafeBase64ToHex: (str: string) => {
    return utils.base64ToHex(str.replace(/_/g, "/").replace(/-/g, "+"));
  },
  bytesToHexString: (bytes: Uint8Array) => {
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
  publishPaymentNotification: (
    message: Message,
    data: PaymentNotificationData
  ) => {
    let status = "success"; // default. let's hope for success
    if ("error" in data.response) {
      status = "failed";
    }
    PubSub.publish(`ln.sendPayment.${status}`, {
      response: data.response,
      details: data.details,
      paymentRequestDetails: data.paymentRequestDetails,
      origin: message.origin,
    });
  },
  openPage: (page: string) => {
    browser.tabs.create({ url: browser.runtime.getURL(page) });
  },
  redirectPage: (page: string) => {
    browser.tabs.update({ url: browser.runtime.getURL(page) });
  },
  openUrl: (url: string) => {
    browser.tabs.create({ url });
  },
  openPrompt: <Type>(message: {
    args: Record<string, unknown>;
    origin: OriginData | OriginDataInternal;
    action: string;
  }): Promise<{ data: Type }> => {
    const urlParams = new URLSearchParams();
    // passing on the message args to the prompt if present
    if (message.args) {
      urlParams.set("args", JSON.stringify(message.args));
    }
    // passing on the message origin to the prompt if present
    if (message.origin) {
      urlParams.set("origin", JSON.stringify(message.origin));
    }
    // action must always be present, this is used to route the request
    urlParams.set("action", message.action);

    const url = `${browser.runtime.getURL(
      "prompt.html"
    )}?${urlParams.toString()}`;

    return new Promise((resolve, reject) => {
      browser.windows
        .create({
          url: url,
          type: "popup",
          width: 400,
          height: 600,
        })
        .then((window) => {
          let tabId: number | undefined;
          if (window.tabs) {
            tabId = window.tabs[0].id;
          }

          const onMessageListener = (
            responseMessage: {
              response?: unknown;
              error?: string;
              data: Type;
            },
            sender: Runtime.MessageSender
          ) => {
            if (
              responseMessage &&
              responseMessage.response &&
              sender.tab &&
              sender.tab.id === tabId
            ) {
              browser.tabs.onRemoved.removeListener(onRemovedListener);
              if (sender.tab.windowId) {
                return browser.windows.remove(sender.tab.windowId).then(() => {
                  if (responseMessage.error) {
                    return reject(new Error(responseMessage.error));
                  } else {
                    return resolve(responseMessage);
                  }
                });
              }
            }
          };

          const onRemovedListener = (tid: number) => {
            if (tabId === tid) {
              browser.runtime.onMessage.removeListener(onMessageListener);
              reject(new Error(ABORT_PROMPT_ERROR));
            }
          };

          browser.runtime.onMessage.addListener(onMessageListener);
          browser.tabs.onRemoved.addListener(onRemovedListener);
        });
    });
  },
  getBoostagramFromInvoice: (
    custom_records:
      | {
          "696969": string;
          "7629169": string;
          "5482373484": string;
        }
      | undefined
  ) => {
    const hasBoostagram = custom_records && 7629169 in custom_records;
    const boostagramDecoded = hasBoostagram
      ? atob(custom_records[7629169])
      : undefined;
    return boostagramDecoded ? JSON.parse(boostagramDecoded) : undefined;
  },
};

export default utils;
