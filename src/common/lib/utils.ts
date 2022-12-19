import browser, { Runtime } from "webextension-polyfill";
import { ABORT_PROMPT_ERROR } from "~/common/constants";
import type { Invoice, OriginData, OriginDataInternal } from "~/types";

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

    return new Promise(async (resolve, reject) => {
      async function getPosition(
        width: number,
        height: number
      ): Promise<{ top: number; left: number }> {
        let left = 0;
        let top = 0;
        try {
          const lastFocused = await browser.windows.getLastFocused();
          // Position window in top right corner of lastFocused window.
          if (
            lastFocused &&
            lastFocused.top != undefined &&
            lastFocused.left != undefined &&
            lastFocused.width != undefined &&
            lastFocused.height != undefined
          ) {
            // Top right
            top = lastFocused.top ?? 0;
            left = lastFocused.left + (lastFocused.width - width);

            // Centered
            top = lastFocused.top + (lastFocused.height - height) / 2;
            left = lastFocused.left + (lastFocused.width - width) / 2;
          }
        } catch (_) {
          // The following properties are more than likely 0, due to being
          // opened from the background chrome process for the extension that
          // has no physical dimensions
          const { screenX, screenY, outerWidth } = window;
          top = Math.max(screenY, 0);
          left = Math.max(screenX + (outerWidth - width), 0);
        }
        return {
          top,
          left,
        };
      }

      const { top, left } = await getPosition(400, 600);
      browser.windows
        .create({
          url: url,
          type: "popup",
          width: 400,
          height: 600,
          top: top,
          left: left,
        })
        .then((window) => {
          let tabId: number | undefined;
          if (window.tabs) {
            tabId = window.tabs[0].id;
          }

          // make sure that the prompt is always focussed
          // this interval focusses the prompt every 2 secons to make sure it is not hidden and
          // that it draws the user's attention to the popup
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
              sender.tab.id === tabId
            ) {
              clearInterval(focusInterval);
              browser.tabs.onRemoved.removeListener(onRemovedListener);
              if (sender.tab.windowId) {
                return browser.windows.remove(sender.tab.windowId).then(() => {
                  // in the future actual "remove" (closing prompt) will be moved to component for i.e. budget flow
                  // https://github.com/getAlby/lightning-browser-extension/issues/1197
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
      const hasBoostagram = custom_records && 7629169 in custom_records;
      const boostagramDecoded = hasBoostagram
        ? atob(custom_records[7629169])
        : undefined;
      return boostagramDecoded ? JSON.parse(boostagramDecoded) : undefined;
    } catch (e) {
      console.error(e);
      return;
    }
  },
};

export default utils;
