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
const helpers_1 = require("~/common/utils/helpers");
const permissions_1 = require("~/extension/background-script/permissions");
const types_1 = require("~/types");
const constants_1 = require("~/common/constants");
const state_1 = __importDefault(require("../../state"));
const signSchnorrOrPrompt = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    const host = (0, helpers_1.getHostFromSender)(sender);
    if (!host)
        return;
    const nostr = yield state_1.default.getState().getNostr();
    const sigHash = message.args.sigHash;
    try {
        if (!sigHash || typeof sigHash !== "string") {
            throw new Error("sigHash is missing or not correct");
        }
        const hasPermission = yield (0, permissions_1.hasPermissionFor)(types_1.PermissionMethodNostr["NOSTR_SIGNSCHNORR"], host);
        const isBlocked = yield (0, permissions_1.isPermissionBlocked)(types_1.PermissionMethodNostr["NOSTR_SIGNSCHNORR"], host);
        if (isBlocked) {
            return { denied: true };
        }
        if (hasPermission) {
            return signSchnorr();
        }
        else {
            const promptResponse = yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "public/nostr/confirmSignSchnorr" }));
            // add permission to db only if user decided to always allow this request
            if (promptResponse.data.permissionOption == constants_1.DONT_ASK_CURRENT) {
                yield (0, permissions_1.addPermissionFor)(types_1.PermissionMethodNostr["NOSTR_SIGNSCHNORR"], host, promptResponse.data.blocked);
            }
            if (promptResponse.data.permissionOption == constants_1.DONT_ASK_ANY) {
                Object.values(types_1.PermissionMethodNostr).forEach((permission) => __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, permissions_1.addPermissionFor)(permission, host, promptResponse.data.blocked);
                }));
            }
            if (promptResponse.data.confirm) {
                return signSchnorr();
            }
            else {
                return { error: constants_1.USER_REJECTED_ERROR };
            }
        }
    }
    catch (e) {
        console.error("signSchnorr cancelled", e);
        if (e instanceof Error) {
            return { error: e.message };
        }
    }
    function signSchnorr() {
        return __awaiter(this, void 0, void 0, function* () {
            const signedSchnorr = yield nostr.signSchnorr(sigHash);
            return { data: signedSchnorr };
        });
    }
});
exports.default = signSchnorrOrPrompt;
