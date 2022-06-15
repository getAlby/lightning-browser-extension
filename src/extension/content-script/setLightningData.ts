import browser from "webextension-polyfill";
import utils from "~/common/lib/utils";
import { Battery } from "~/types";

const setLightningData = (data: [Battery]): void => {
  // Pass lightningData to e2e tests
  if (process.env.NODE_ENV == "development") {
    window.postMessage({
      application: "e2e",
      lightningData: data,
      action: "lightningData",
    });
  }

  browser.runtime.sendMessage({
    application: "LBE",
    action: "lightningData",
    args: data,
  });
  utils.call("setIcon", { icon: "active" });
};
export default setLightningData;
