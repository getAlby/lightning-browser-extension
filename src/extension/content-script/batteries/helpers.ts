import browser from "webextension-polyfill";
import utils from "~/common/lib/utils";
import type { Battery } from "~/types";

import { ExtensionIcon } from "../../background-script/actions/setup/setIcon";

export const findLightningAddressInText = (text: string): string | null => {
  const match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@[\w-.]+)/i);
  if (match) return match[2];
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
