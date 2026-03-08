"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrencyRateWithCache = void 0;
const axios_1 = __importDefault(require("axios"));
const dayjs_1 = __importDefault(require("dayjs"));
const isSameOrBefore_1 = __importDefault(require("dayjs/plugin/isSameOrBefore"));
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const currencyConvert_1 = require("~/common/utils/currencyConvert");
const state_1 = __importDefault(require("~/extension/background-script/state"));
dayjs_1.default.extend(isSameOrBefore_1.default);
const axiosOptions = process.env.NODE_ENV === "test" ? {} : { adapter: "fetch" };
const storeCurrencyRate = ({ rate, currency }) => __awaiter(void 0, void 0, void 0, function* () {
    const currencyRate = {
        currency,
        rate,
        timestamp: Date.now(),
    };
    yield webextension_polyfill_1.default.storage.local.set({
        currencyRate: JSON.stringify(currencyRate),
    });
});
const getFiatBtcRate = (currency) => __awaiter(void 0, void 0, void 0, function* () {
    const { settings } = state_1.default.getState();
    const { exchange } = settings;
    let response;
    if (exchange === "yadio") {
        response = yield axios_1.default.get(`https://api.yadio.io/exrates/${currency.toLowerCase()}`, axiosOptions);
        const data = yield (response === null || response === void 0 ? void 0 : response.data);
        return data.BTC / currencyConvert_1.numSatsInBtc;
    }
    if (exchange === "coindesk") {
        response = yield axios_1.default.get(`https://api.coindesk.com/v1/bpi/currentprice/${currency.toLowerCase()}.json`, axiosOptions);
        const data = yield (response === null || response === void 0 ? void 0 : response.data);
        return data.bpi[currency].rate_float / currencyConvert_1.numSatsInBtc;
    }
    response = yield axios_1.default.get(`https://getalby.com/api/rates/${currency.toLowerCase()}.json`, axiosOptions);
    const data = yield (response === null || response === void 0 ? void 0 : response.data);
    return data[currency].rate_float / currencyConvert_1.numSatsInBtc;
});
const getCurrencyRateWithCache = (currency) => __awaiter(void 0, void 0, void 0, function* () {
    let currencyRateCache = {};
    const result = yield webextension_polyfill_1.default.storage.local.get(["currencyRate"]);
    if (result.currencyRate) {
        currencyRateCache = JSON.parse(result.currencyRate);
        if (currencyRateCache.currency === currency) {
            const isRateNewEnough = (0, dayjs_1.default)().isSameOrBefore((0, dayjs_1.default)(currencyRateCache === null || currencyRateCache === void 0 ? void 0 : currencyRateCache.timestamp).add(10, "minute"));
            if (isRateNewEnough && currencyRateCache.rate) {
                return currencyRateCache.rate;
            }
            const rate = yield getFiatBtcRate(currency);
            yield storeCurrencyRate({ rate, currency });
            return rate;
        }
    }
    const rate = yield getFiatBtcRate(currency);
    yield storeCurrencyRate({ currency, rate });
    return rate;
});
exports.getCurrencyRateWithCache = getCurrencyRateWithCache;
const getCurrencyRate = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const { currency } = state_1.default.getState().settings;
    const rate = yield (0, exports.getCurrencyRateWithCache)(currency);
    return {
        data: { rate },
    };
});
exports.default = getCurrencyRate;
