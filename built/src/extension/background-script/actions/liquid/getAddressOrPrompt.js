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
const utils_1 = __importDefault(require("~/common/lib/utils"));
const permissions_1 = require("~/extension/background-script/permissions");
const types_1 = require("~/types");
const state_1 = __importDefault(require("../../state"));
const getAddressOrPrompt = (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (!("host" in message.origin)) {
        console.error("error", message.origin);
        return;
    }
    try {
        const hasPermission = yield (0, permissions_1.hasPermissionFor)(types_1.PermissionMethodLiquid["LIQUID_GETADDRESS"], message.origin.host);
        const liquid = yield state_1.default.getState().getLiquid();
        if (hasPermission) {
            const publicKey = liquid.getPublicKey();
            const address = liquid.getAddress();
            return {
                data: Object.assign(Object.assign({}, address), { publicKey }),
            };
        }
        else {
            const promptResponse = yield utils_1.default.openPrompt(Object.assign(Object.assign({ args: {} }, message), { action: "public/liquid/confirmGetAddress" }));
            // add permission to db only if user decided to always allow this request
            if (promptResponse.data.rememberPermission) {
                yield (0, permissions_1.addPermissionFor)(types_1.PermissionMethodLiquid["LIQUID_GETADDRESS"], message.origin.host, promptResponse.data.blocked);
            }
            if (promptResponse.data.confirm) {
                // Normally `openPrompt` would throw already, but to make sure we got a confirm from the user we check this here
                const publicKey = liquid.getPublicKey();
                const address = liquid.getAddress();
                return {
                    data: Object.assign(Object.assign({}, address), { publicKey }),
                };
            }
            else {
                return { error: "User rejected" };
            }
        }
    }
    catch (e) {
        console.error("getAddress failed", e);
        if (e instanceof Error) {
            return { error: e.message };
        }
    }
});
exports.default = getAddressOrPrompt;
