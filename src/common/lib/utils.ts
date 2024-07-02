import browser, { Runtime } from "webextension-polyfill";
import { ABORT_PROMPT_ERROR } from "~/common/constants";
import { base64DecodeUnicode } from "~/common/lib/string";
import { ConnectorTransaction } from "~/extension/background-script/connectors/connector.interface";
import type { DeferredPromise, OriginData, OriginDataInternal } from "~/types";
import { createPromptTab, createPromptWindow } from "../utils/window";

const utils = {
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
  deferredPromise: (): DeferredPromise => {
    let resolve: DeferredPromise["resolve"];
    let reject: DeferredPromise["reject"];
    const promise = new Promise<void>(
      (innerResolve: () => void, innerReject: () => void) => {
        resolve = innerResolve;
        reject = innerReject;
      }
    );
    return { promise, resolve, reject };
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
  openPrompt: async <Type>(message: {
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

    // Window APIs might not be available on mobile browsers
    // on iOS window APIs are available, but `windows.create` is not
    const useWindow = !!(browser.windows && browser.windows.create);

    // Either API yields a tabId
    const tabId = useWindow
      ? await createPromptWindow(url)
      : await createPromptTab(url);

    return new Promise((resolve, reject) => {
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
          sender.tab.id === tabId &&
          sender.tab.windowId
        ) {
          // Remove the event listener as we are about to close the tab
          browser.tabs.onRemoved.removeListener(onRemovedListener);

          // Use window APIs for removing the window as Opera doesn't
          // close the window if you remove the last tab (e.g. in popups)
          let closePromise;
          if (useWindow) {
            closePromise = browser.windows.remove(sender.tab.windowId);
          } else {
            closePromise = browser.tabs.remove(tabId);
          }

          return closePromise.then(() => {
            // in the future actual "remove" (closing prompt) will be moved to component for i.e. budget flow
            // https://github.com/getAlby/lightning-browser-extension/issues/1197
            if (responseMessage.error) {
              return reject(new Error(responseMessage.error));
            } else {
              return resolve(responseMessage);
            }
          });
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
  },

  getBoostagramFromInvoiceCustomRecords: (
    custom_records: ConnectorTransaction["custom_records"] | undefined
  ) => {
    try {
      let boostagramDecoded: string | undefined;
      const boostagram = custom_records?.[7629169];
      if (boostagram) {
        boostagramDecoded = base64DecodeUnicode(boostagram);
      }

      return boostagramDecoded ? JSON.parse(boostagramDecoded) : undefined;
    } catch (e) {
      console.error(e);
      return;
    }
  },
};

export default utils;
