import Lnd from "./lnd";
import NativeLnd from "./nativelnd";
import LndHub from "./lndhub";
import NativeLndHub from "./nativelndhub";
import LnBits from "./lnbits";
import Eclair from "./eclair";
import Citadel from "./citadel";
import NativeCitadel from "./nativecitadel";

/*
const initialize = (account, password) => {
  const config = decryptData(account.config, password);
  const connector = new connectors[account.connector](config);
  return connector;
};
*/

const connectors = {
  lnd: Lnd,
  nativelnd: NativeLnd,
  lndhub: LndHub,
  nativelndhub: NativeLndHub,
  lnbits: LnBits,
  eclair: Eclair,
  citadel: Citadel,
  nativecitadel: NativeCitadel,
};

export default connectors;
