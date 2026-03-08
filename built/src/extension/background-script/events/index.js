"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribe = void 0;
const pubsub_js_1 = __importDefault(require("pubsub-js"));
const allowances_1 = require("./allowances");
const notifications_1 = require("./notifications");
const persistPayments_1 = require("./persistPayments");
const subscribe = () => {
    const paymentTypes = ["sendPayment", "keysend"];
    paymentTypes.forEach((type) => {
        // @ts-expect-error typed as ln.sendPayment.success | ln.keysend.success
        pubsub_js_1.default.subscribe(`ln.${type}.success`, notifications_1.paymentSuccessNotification);
        // @ts-expect-error typed as ln.sendPayment.success | ln.keysend.success
        pubsub_js_1.default.subscribe(`ln.${type}.failed`, notifications_1.paymentFailedNotification);
        // @ts-expect-error typed as ln.sendPayment.success | ln.keysend.success
        pubsub_js_1.default.subscribe(`ln.${type}.success`, persistPayments_1.persistSuccessfulPayment);
        // @ts-expect-error typed as ln.sendPayment.success | ln.keysend.success
        pubsub_js_1.default.subscribe(`ln.${type}.success`, allowances_1.updateAllowance);
    });
    // @ts-expect-error typed as lnurl.auth.success
    pubsub_js_1.default.subscribe("lnurl.auth.success", notifications_1.lnurlAuthSuccessNotification);
    // @ts-expect-error typed as lnurl.auth.failed
    pubsub_js_1.default.subscribe("lnurl.auth.failed", notifications_1.lnurlAuthFailedNotification);
    console.info(`Event subscriptions registered`);
};
exports.subscribe = subscribe;
