import getAddress from "~/extension/background-script/actions/webbtc/getAddress";
import getAddressOrPrompt from "~/extension/background-script/actions/webbtc/getAddressOrPrompt";
import signPsbt from "~/extension/background-script/actions/webbtc/signPsbt";

import getInfo from "./getInfo";
import signPsbtWithPrompt from "./signPsbtWithPrompt";

export {
  getAddress,
  getAddressOrPrompt,
  getInfo,
  signPsbt,
  signPsbtWithPrompt,
};
