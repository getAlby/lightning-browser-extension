import Alby from "./alby";
import Eclair from "./eclair";
import Galoy from "./galoy";
import LnBits from "./lnbits";
import Lnc from "./lnc";
import Lnd from "./lnd";
import LndHub from "./lndhub";
import NWC from "./nwc";

/*
const initialize = (account, password) => {
  const config = decryptData(account.config, password);
  const connector = new connectors[account.connector](config);
  return connector;
};
*/

const connectors = {
  lnd: Lnd,
  lndhub: LndHub,
  lnbits: LnBits,
  lnc: Lnc,
  galoy: Galoy,
  eclair: Eclair,
  alby: Alby,
  nwc: NWC,
};

export default connectors;
