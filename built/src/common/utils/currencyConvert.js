"use strict";
/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormattedSats = exports.getFormattedNumber = exports.getFormattedFiat = exports.getFormattedCurrency = exports.getBTCToSats = exports.getSatsToBTC = exports.numSatsInBtc = void 0;
const i18nConfig_1 = __importDefault(require("~/i18n/i18nConfig"));
exports.numSatsInBtc = 100000000;
const getSatsToBTC = (sats) => Number(sats) / exports.numSatsInBtc;
exports.getSatsToBTC = getSatsToBTC;
const getBTCToSats = (btc) => Number(btc) * exports.numSatsInBtc;
exports.getBTCToSats = getBTCToSats;
const getFormattedCurrency = (params) => {
    const l = (params.locale || "en").toLowerCase().replace("_", "-");
    return new Intl.NumberFormat(l || "en", {
        style: "currency",
        currency: params.currency,
    }).format(Number(params.amount));
};
exports.getFormattedCurrency = getFormattedCurrency;
const getFormattedFiat = (params) => {
    const fiatValue = Number(params.amount) * params.rate;
    return (0, exports.getFormattedCurrency)(Object.assign(Object.assign({}, params), { amount: fiatValue }));
};
exports.getFormattedFiat = getFormattedFiat;
const getFormattedNumber = (params) => {
    const l = (params.locale || "en").toLowerCase().replace("_", "-");
    return new Intl.NumberFormat(l || "en").format(Number(params.amount));
};
exports.getFormattedNumber = getFormattedNumber;
const getFormattedSats = (params) => {
    const formattedNumber = (0, exports.getFormattedNumber)(params);
    return `${formattedNumber} ${i18nConfig_1.default.t("common:sats", {
        count: Number(params.amount),
    })}`;
};
exports.getFormattedSats = getFormattedSats;
