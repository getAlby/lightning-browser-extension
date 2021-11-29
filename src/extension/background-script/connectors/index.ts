// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: implicitly has 'any' type error
import Native from "./native";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: implicitly has 'any' type error
import Lnd from "./lnd";
import LndHub from "./lndhub";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: implicitly has 'any' type error
import LnBits from "./lnbits";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: implicitly has 'any' type error
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
