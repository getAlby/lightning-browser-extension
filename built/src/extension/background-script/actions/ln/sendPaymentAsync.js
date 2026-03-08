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
const state_1 = __importDefault(require("~/extension/background-script/state"));
function sendPayment(message) {
    return __awaiter(this, void 0, void 0, function* () {
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
        // NOTE: currently there is no way to know if the initial payment
        //   succeeds or not. The payment might not work at all or the http request might time out
        //   before the HODL invoice is paid or times out itself.
        //   any errors thrown by sendPayment will not be caught.
        // NOTE: it is the receiver's responsibility to check if they have received the payment or not
        //   and update the UI or re-prompt the user if they haven't received a payment.
        connector.sendPayment({
            paymentRequest,
        });
        return {
            data: {},
        };
    });
}
exports.default = sendPayment;
