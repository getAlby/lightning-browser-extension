import browser from "webextension-polyfill";
import msg from "~/common/lib/msg";
import type { Battery } from "~/types";

// duplicate also in setup/setIcon action
enum ExtensionIcon {
  Default = "alby_icon_yellow",
  Tipping = "alby_icon_blue",
  Active = "alby_icon_green",
}

export const setLightningData = (data: [Battery]): void => {
  browser.runtime.sendMessage({
    application: "LBE",
    action: "lightningData",
    args: data,
  });
  msg.request("setIcon", { icon: ExtensionIcon.Tipping });
};

/**
 * Returns true if the given string looks like a Lightning node public key.
 *
 * Supports:
 *  - Compressed pubkeys: 02 or 03 prefix followed by 64 hex chars (66 total)
 *  - Uncompressed pubkeys: 04 prefix followed by 128 hex chars (130 total)
 */
export const isPubKey = (value: string): boolean => {
  const compressed = /^(02|03)[0-9a-fA-F]{64}$/;
  const uncompressed = /^04[0-9a-fA-F]{128}$/;
  return compressed.test(value) || uncompressed.test(value);
};
