import Citadel from "./citadel";
import Eclair from "./eclair";
import Galoy from "./galoy";
import Kollider from "./kollider";
import LnBits from "./lnbits";
import Lnd from "./lnd";
import LndHub from "./lndhub";
import NativeCitadel from "./nativecitadel";
import NativeLnBits from "./nativelnbits";
import NativeLnd from "./nativelnd";
import NativeLndHub from "./nativelndhub";

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
  nativelnbits: NativeLnBits,
  galoy: Galoy,
  eclair: Eclair,
  citadel: Citadel,
  nativecitadel: NativeCitadel,
  kollider: Kollider,
};

export default connectors;
