const Native: any = require("./native");
const Lnd: any = require("./lnd");
const LndHub: any = require("./lndhub");
const LnBits: any = require("./lnbits");
const Base: any = require("./base");

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
