"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pubsub_js_1 = __importDefault(require("pubsub-js"));
const pubsub = {
    publishPaymentNotification: (type, message, // 'keysend' & 'sendPaymentOrPrompt' still need the Message type
    data) => {
        let status = "success"; // default. let's hope for success
        if ("error" in data.response) {
            status = "failed";
        }
        pubsub_js_1.default.publish(`ln.${type}.${status}`, {
            accountId: data.accountId,
            response: data.response,
            details: data.details,
            paymentRequestDetails: data.paymentRequestDetails,
            origin: message.origin,
        });
    },
};
exports.default = pubsub;
