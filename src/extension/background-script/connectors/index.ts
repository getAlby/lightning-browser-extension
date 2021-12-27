import Lnd from "./lnd";
import NativeLnd from "./nativelnd";
import LndHub from "./lndhub";
import LnBits from "./lnbits";

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
  lnbits: LnBits,
};

export default connectors;
