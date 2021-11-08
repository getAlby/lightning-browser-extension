import utils from "../../common/lib/utils";
import { Battery } from "../../types";

const setLightningData = (data: [Battery] | null): void => {
  if (data) {
    window.LBE_LIGHTNING_DATA = data;
    utils.call("setIcon", { icon: "active" });
  } else {
    utils.call("setIcon", { icon: "off" });
  }
};
export default setLightningData;
