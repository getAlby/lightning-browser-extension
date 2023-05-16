import getAddresses from "~/extension/background-script/actions/webbtc/getAddresses";
import getAddressesWithPrompt from "~/extension/background-script/actions/webbtc/getAddressesWithPrompt";
import getDerivationPath from "~/extension/background-script/actions/webbtc/getDerivationPath";
import signPsbt from "~/extension/background-script/actions/webbtc/signPsbt";

import getInfo from "./getInfo";
import signPsbtWithPrompt from "./signPsbtWithPrompt";

export {
  getInfo,
  signPsbtWithPrompt,
  signPsbt,
  getAddressesWithPrompt,
  getAddresses,
  getDerivationPath,
};
