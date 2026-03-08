"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const msg = {
    request: (action, args, overwrites) => {
        return webextension_polyfill_1.default.runtime
            .sendMessage(Object.assign({ application: "LBE", prompt: true, action: action, args: args, origin: { internal: true } }, overwrites))
            .then((response) => {
            if (response.error) {
                throw new Error(response.error);
            }
            return response.data;
        });
    },
    reply: (data) => {
        return webextension_polyfill_1.default.runtime.sendMessage({
            application: "LBE",
            response: true,
            data: data,
            origin: { internal: true },
        });
    },
    error: (error) => {
        return webextension_polyfill_1.default.runtime.sendMessage({
            application: "LBE",
            response: true,
            error: error,
            origin: { internal: true },
        });
    },
};
exports.default = msg;
