import browser, { Runtime } from "webextension-polyfill";
import { ABORT_PROMPT_ERROR } from "~/common/constants";
import { getPosition as getWindowPosition } from "~/common/utils/window";
import type {
  DeferredPromise,
  Invoice,
  OriginData,
  OriginDataInternal,
} from "~/types";

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

    const windowWidth = 400;
    const windowHeight = 600;

    const { top, left } = await getWindowPosition(windowWidth, windowHeight);

    return new Promise((resolve, reject) => {
      browser.windows
        .create({
          url: url,
          type: "popup",
          width: windowWidth,
          height: windowHeight,
          top: top,
          left: left,
        })
        .then((window) => {
          let closeWindow = true; // by default we call remove.window (except the browser forces this prompt to open in a tab)
          let tabId: number | undefined;
          if (window.tabs) {
            tabId = window.tabs[0].id;
          }

          // Kiwi Browser opens the prompt in the same window (there are only tabs on mobile browsers)
          // Find the currently active tab to validate messages
          if (window.tabs && window.tabs?.length > 1) {
            tabId = window.tabs?.find((x) => x.active)?.id;
            closeWindow = false; // we'll only remove the tab and not the window further down
          }

          // this interval hightlights the popup in the taskbar
          const focusInterval = setInterval(() => {
            if (!window.id) {
              return;
            }
            browser.windows.update(window.id, {
              drawAttention: true,
            });
          }, 2100);

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
              clearInterval(focusInterval);
              browser.tabs.onRemoved.removeListener(onRemovedListener);
              // if the window was opened as tab we remove the tab
              // otherwise if a window was opened we have to remove the window.
              // Opera fails to close the window with tabs.remove - it fails with: "Tabs cannot be edited right now (user may be dragging a tab)"
              let closePromise;
              if (closeWindow) {
                closePromise = browser.windows.remove(sender.tab.windowId);
              } else {
                closePromise = browser.tabs.remove(sender.tab.id as number); // as number only for TS - we check for sender.tab.id in the if above
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
            clearInterval(focusInterval);
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
  getBoostagramFromInvoiceCustomRecords: (
    custom_records: Invoice["custom_records"] | undefined
  ) => {
    try {
      let boostagramDecoded: string | undefined;
      const boostagram = custom_records?.[7629169];
      if (boostagram) {
        boostagramDecoded = atob(boostagram);
      }
      return boostagramDecoded ? JSON.parse(boostagramDecoded) : undefined;
    } catch (e) {
      console.error(e);
      return;
    }
  },
};

export default utils;
