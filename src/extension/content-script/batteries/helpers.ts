import browser from "webextension-polyfill";
import lnurlLib from "~/common/lib/lnurl";
import msg from "~/common/lib/msg";
import type { Battery } from "~/types";

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

export const findLightningAddressInText = (text: string): string | null => {
  // Use the same broad candidate-extraction regex as lnurl.ts fromInternetIdentifier
  // to avoid missing valid Lightning addresses with complex local parts.
  const lightningAddressRegex =
    /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"[^"]*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/g;
  const candidates = text.match(lightningAddressRegex);
  if (candidates) {
    for (const candidate of candidates) {
      if (lnurlLib.isLightningAddress(candidate)) {
        return candidate;
      }
    }
  }
  return null;
};
