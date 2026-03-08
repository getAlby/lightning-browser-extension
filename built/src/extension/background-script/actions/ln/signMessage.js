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
const state_1 = __importDefault(require("../../state"));
const signMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    pubsub_js_1.default.publish(`ln.signMessage.start`, message);
    const messageToSign = message.args.message;
    if (typeof messageToSign !== "string") {
        return {
            error: "Message missing.",
        };
    }
    if (messageToSign.startsWith("DO NOT EVER SIGN THIS TEXT")) {
        return {
            error: "forbidden",
        };
    }
    const connector = yield state_1.default.getState().getConnector();
    try {
        const response = yield connector.signMessage({
            message: messageToSign,
            // TODO: remove? do we need this option?
            key_loc: {
                key_family: 0,
                key_index: 0,
            },
        });
        return response;
    }
    catch (e) {
        console.error(e);
        if (e instanceof Error) {
            pubsub_js_1.default.publish(`ln.signMessage.failed`, {
                error: e.message,
                message: messageToSign,
                origin: message.origin,
            });
            return { error: e.message };
        }
    }
});
exports.default = signMessage;
