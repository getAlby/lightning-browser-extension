// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: implicitly has 'any' type error
import Native from "./native";
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
  native: Native,
  lnd: Lnd,
  nativelnd: NativeLnd,
  lndhub: LndHub,
  lnbits: LnBits,
};

export default connectors;
