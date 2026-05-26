import Alby from "./alby";
import Eclair from "./eclair";
import Galoy from "./galoy";
import LaWallet from "./lawallet";
import LnBits from "./lnbits";
import Lnc from "./lnc";
import Lnd from "./lnd";
import LndHub from "./lndhub";
import NativeLnBits from "./nativelnbits";
import NativeLnd from "./nativelnd";
import NativeLndHub from "./nativelndhub";
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
  nativelnd: NativeLnd,
  lndhub: LndHub,
  nativelndhub: NativeLndHub,
  lnbits: LnBits,
  lnc: Lnc,
  nativelnbits: NativeLnBits,
  galoy: Galoy,
  eclair: Eclair,
  alby: Alby,
  nwc: NWC,
  lawallet: LaWallet,
};

export default connectors;
