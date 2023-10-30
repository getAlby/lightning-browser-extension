import enable from "~/extension/background-script/actions/webbtc/enable";
import getAddress from "~/extension/background-script/actions/webbtc/getAddress";
import getAddressOrPrompt from "~/extension/background-script/actions/webbtc/getAddressOrPrompt";
import getInfo from "~/extension/background-script/actions/webbtc/getInfo";
import getPsbtPreview from "~/extension/background-script/actions/webbtc/getPsbtPreview";
import isEnabled from "~/extension/background-script/actions/webbtc/isEnabled";
import signPsbt from "~/extension/background-script/actions/webbtc/signPsbt";
import signPsbtWithPrompt from "~/extension/background-script/actions/webbtc/signPsbtWithPrompt";

export {
  enable,
  getAddress,
  getAddressOrPrompt,
  getInfo,
  getPsbtPreview,
  isEnabled,
  signPsbt,
  signPsbtWithPrompt,
};
