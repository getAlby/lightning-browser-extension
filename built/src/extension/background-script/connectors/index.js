"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const alby_1 = __importDefault(require("./alby"));
const citadel_1 = __importDefault(require("./citadel"));
const eclair_1 = __importDefault(require("./eclair"));
const galoy_1 = __importDefault(require("./galoy"));
const kollider_1 = __importDefault(require("./kollider"));
const lawallet_1 = __importDefault(require("./lawallet"));
const lnbits_1 = __importDefault(require("./lnbits"));
const lnc_1 = __importDefault(require("./lnc"));
const lnd_1 = __importDefault(require("./lnd"));
const lndhub_1 = __importDefault(require("./lndhub"));
const nativecitadel_1 = __importDefault(require("./nativecitadel"));
const nativelnbits_1 = __importDefault(require("./nativelnbits"));
const nativelnd_1 = __importDefault(require("./nativelnd"));
const nativelndhub_1 = __importDefault(require("./nativelndhub"));
const nwc_1 = __importDefault(require("./nwc"));
/*
const initialize = (account, password) => {
  const config = decryptData(account.config, password);
  const connector = new connectors[account.connector](config);
  return connector;
};
*/
const connectors = {
    lnd: lnd_1.default,
    nativelnd: nativelnd_1.default,
    lndhub: lndhub_1.default,
    nativelndhub: nativelndhub_1.default,
    kollider: kollider_1.default,
    lnbits: lnbits_1.default,
    lnc: lnc_1.default,
    nativelnbits: nativelnbits_1.default,
    galoy: galoy_1.default,
    eclair: eclair_1.default,
    citadel: citadel_1.default,
    nativecitadel: nativecitadel_1.default,
    alby: alby_1.default,
    nwc: nwc_1.default,
    lawallet: lawallet_1.default,
};
exports.default = connectors;
