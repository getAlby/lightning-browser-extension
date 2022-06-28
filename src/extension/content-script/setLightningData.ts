import browser from "webextension-polyfill";
import utils from "~/common/lib/utils";
import { Battery } from "~/types";

import { ExtensionIcon } from "../background-script/actions/setup/setIcon";

const setLightningData = (data: [Battery]): void => {
  browser.runtime.sendMessage({
    application: "LBE",
    action: "lightningData",
    args: data,
  });
  utils.call("setIcon", { icon: ExtensionIcon.Tipping });
};
export default setLightningData;
