import browser from "webextension-polyfill";
import utils from "~/common/lib/utils";
import type { Battery } from "~/types";

import { ExtensionIcon } from "../../background-script/actions/setup/setIcon";

export const findLightningAddressInText = (text: string): string | null => {
  // The second lightning emoji is succeeded by an invisible
  // variation selector-16 character: https://regex101.com/r/Bf2GpN/1
  const match = text.match(/((⚡|⚡️):?|lightning:|lnurl:)\s?(\S+@[\w-.]+)/i);
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
  utils.call("setIcon", { icon: ExtensionIcon.Tipping });
};
