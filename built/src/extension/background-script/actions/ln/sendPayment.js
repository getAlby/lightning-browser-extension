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
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const pubsub_js_1 = __importDefault(require("pubsub-js"));
const pubsub_1 = __importDefault(require("~/common/lib/pubsub"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
function sendPayment(message // 'keysend' & 'sendPaymentOrPrompt' still need the Message type
) {
    return __awaiter(this, void 0, void 0, function* () {
        pubsub_js_1.default.publish(`ln.sendPayment.start`, message);
        const accountId = yield state_1.default.getState().currentAccountId;
        if (!accountId) {
            return {
                error: "Select an account.",
            };
        }
        const { paymentRequest } = message.args;
        if (typeof paymentRequest !== "string") {
            return {
                error: "Payment request missing.",
            };
        }
        const connector = yield state_1.default.getState().getConnector();
        let response, paymentRequestDetails;
        try {
            paymentRequestDetails = bolt11_signet_1.default.decode(paymentRequest);
            response = yield connector.sendPayment({
                paymentRequest,
            });
        }
        catch (e) {
            let errorMessage;
            if (typeof e === "string") {
                errorMessage = e;
            }
            else if (e.message) {
                errorMessage = e.message;
            }
            else {
                errorMessage = "Something went wrong";
            }
            response = {
                error: errorMessage,
            };
        }
        pubsub_1.default.publishPaymentNotification("sendPayment", message, {
            accountId,
            paymentRequestDetails,
            response,
            details: Object.assign({}, (paymentRequestDetails && {
                description: paymentRequestDetails.tagsObject.description,
                destination: paymentRequestDetails.payeeNodeKey,
            })),
        });
        return response;
    });
}
exports.default = sendPayment;
