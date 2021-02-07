import Native from "./native";
import Lnd from "./lnd";
import LndHub from "./lndhub";
import Base from "./base";

const connectors = {
  base: Base,
  native: Native,
  lnd: Lnd,
  lndhub: LndHub,
};

export default connectors;
