import browser from "webextension-polyfill";

import utils from "../../common/lib/utils";
import { Battery } from "../../types";

const setLightningData = (data: [Battery]): void => {
  browser.runtime.sendMessage({
    application: "LBE",
    type: "lightningData",
    args: data,
  });
  utils.call("setIcon", { icon: "active" });
};
export default setLightningData;
