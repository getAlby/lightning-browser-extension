import Native from "./native";
import Lnd from "./lnd";
import LndHub from "./lndhub";
import LnBits from "./lnbits";
import Base from "./base";

/*
const initialize = (account, password) => {
  const config = decryptData(account.config, password);
  const connector = new connectors[account.connector](config);
  return connector;
};
*/

const connectors = {
  base: Base,
  native: Native,
  lnd: Lnd,
  lndhub: LndHub,
  lnbits: LnBits,
};

export default connectors;
