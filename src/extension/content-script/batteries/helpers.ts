import browser from "webextension-polyfill";
import lnurl from "~/common/lib/lnurl";
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

export const findLightningAddressInText = (text: string): string | null => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (match && lnurl.isLightningAddress(match[0])) {
    return match[0];
  }
  return null;
};
