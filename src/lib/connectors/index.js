import Native from "./native";
import Lnd from "./lnd";
import LndHub from "./lndhub";
import LnBits from "./lnbits";
import Base from "./base";

const connectors = {
  base: Base,
  native: Native,
  lnd: Lnd,
  lndhub: LndHub,
  lnbits: LnBits,
};

export default connectors;
