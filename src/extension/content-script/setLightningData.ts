import browser from "webextension-polyfill";
import utils from "~/common/lib/utils";
import { Battery } from "~/types";

const setLightningData = (data: [Battery]): void => {
  browser.runtime.sendMessage({
    application: "LBE",
    action: "lightningData",
    args: data,
  });
  utils.call("setIcon", { icon: "available" });
};
export default setLightningData;
