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
exports.paymentSuccessNotification = exports.paymentFailedNotification = exports.lnurlAuthSuccessNotification = exports.lnurlAuthFailedNotification = void 0;
const currencyConvert_1 = require("~/common/utils/currencyConvert");
const getCurrencyRate_1 = require("~/extension/background-script/actions/cache/getCurrencyRate");
const state_1 = __importDefault(require("~/extension/background-script/state"));
const helpers_1 = require("./helpers");
const paymentSuccessNotification = (message, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const recipient = (_a = data === null || data === void 0 ? void 0 : data.origin) === null || _a === void 0 ? void 0 : _a.name;
    const paymentResponseData = data.response;
    let paymentAmountFiatLocale;
    if ("error" in paymentResponseData) {
        return;
    }
    const route = paymentResponseData === null || paymentResponseData === void 0 ? void 0 : paymentResponseData.data.route;
    const { total_amt, total_fees } = route;
    const paymentAmount = total_amt;
    const { settings } = state_1.default.getState();
    const { showFiat, currency, locale } = settings;
    if (showFiat) {
        const rate = yield (0, getCurrencyRate_1.getCurrencyRateWithCache)(currency);
        paymentAmountFiatLocale = (0, currencyConvert_1.getFormattedFiat)({
            amount: paymentAmount,
            rate,
            currency,
            locale,
        });
    }
    let notificationTitle = "✅ Successfully paid";
    if (recipient) {
        notificationTitle = `${notificationTitle} to »${recipient}«`;
    }
    let notificationMessage = `Amount: ${(0, currencyConvert_1.getFormattedSats)({
        amount: paymentAmount,
        locale,
    })}`;
    if (showFiat) {
        notificationMessage = `${notificationMessage} (${paymentAmountFiatLocale})`;
    }
    notificationMessage = `${notificationMessage}\nFee: ${(0, currencyConvert_1.getFormattedSats)({
        amount: total_fees,
        locale,
    })}`;
    return (0, helpers_1.notify)({
        title: notificationTitle,
        message: notificationMessage,
    });
});
exports.paymentSuccessNotification = paymentSuccessNotification;
const paymentFailedNotification = (message, data) => {
    let error;
    const paymentResponseData = data.response;
    if ("error" in paymentResponseData) {
        // general error
        error = paymentResponseData.error;
    }
    return (0, helpers_1.notify)({
        title: `⚠️ Payment failed`,
        message: `Error: ${error}`,
    });
};
exports.paymentFailedNotification = paymentFailedNotification;
const lnurlAuthSuccessNotification = (message, data) => {
    var _a;
    let title = "✅ Login";
    if ((_a = data === null || data === void 0 ? void 0 : data.origin) === null || _a === void 0 ? void 0 : _a.name) {
        title = `${title} to ${data.origin.name}`;
    }
    return (0, helpers_1.notify)({
        title,
        message: `Successfully logged in to ${data.lnurlDetails.domain}`,
    });
};
exports.lnurlAuthSuccessNotification = lnurlAuthSuccessNotification;
const lnurlAuthFailedNotification = (message, data) => {
    return (0, helpers_1.notify)({
        title: `⚠️ Login failed`,
        message: `${data.error}`,
    });
};
exports.lnurlAuthFailedNotification = lnurlAuthFailedNotification;
