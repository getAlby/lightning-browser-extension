import browser from "webextension-polyfill";
import msg from "~/common/lib/msg";
import type { Battery } from "~/types";

// duplicate also in setup/setIcon action
enum ExtensionIcon {
  Default = "alby_icon_yellow",
  Tipping = "alby_icon_blue",
  Active = "alby_icon_green",
}

export const findLightningAddressInText = (text: string): string | null => {
  // The second lightning emoji is succeeded by an invisible
  // variation selector-16 character: https://regex101.com/r/Bf2GpN/1
  const match = text.match(
    /((⚡|⚡️):?|lightning:|lnurl:)\s?([\w-.]+@[\w-.]+[.][\w-.]+)/i
  );
  if (match) return match[3];
  const matchAlbyLink = text.match(
    /http(s)?:\/\/(www[.])?getalby\.com\/p\/(\w+)/
  );
  if (matchAlbyLink) return matchAlbyLink[3] + "@getalby.com";
  return null;
};

export const setLightningData = (data: [Battery]): void => {
  browser.runtime.sendMessage({
    application: "LBE",
    action: "lightningData",
    args: data,
  });
  msg.request("setIcon", { icon: ExtensionIcon.Tipping });
};
