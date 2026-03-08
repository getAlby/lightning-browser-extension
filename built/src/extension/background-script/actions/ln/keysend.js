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
const pubsub_js_1 = __importDefault(require("pubsub-js"));
const pubsub_1 = __importDefault(require("~/common/lib/pubsub"));
const state_1 = __importDefault(require("../../state"));
function keysend(message) {
    return __awaiter(this, void 0, void 0, function* () {
        pubsub_js_1.default.publish(`ln.keysend.start`, message);
        const { destination, amount, customRecords } = message.args;
        const accountId = yield state_1.default.getState().currentAccountId;
        if (!accountId) {
            return {
                error: "Select an account.",
            };
        }
        if (typeof destination !== "string" ||
            (typeof amount !== "string" && typeof amount !== "number")) {
            return {
                error: "Destination or amount missing.",
            };
        }
        const connector = yield state_1.default.getState().getConnector();
        let response;
        try {
            response = yield connector.keysend({
                pubkey: destination,
                amount: parseInt(amount),
                customRecords: customRecords,
            });
        }
        catch (e) {
            response = {
                error: e instanceof Error ? e.message : "Something went wrong",
            };
        }
        pubsub_1.default.publishPaymentNotification("keysend", message, {
            accountId,
            response,
            details: {
                destination: destination,
            },
        });
        return response;
    });
}
exports.default = keysend;
