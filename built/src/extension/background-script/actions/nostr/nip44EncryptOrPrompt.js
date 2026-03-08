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
const constants_1 = require("~/common/constants");
const nostr_1 = __importDefault(require("~/common/lib/nostr"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const helpers_1 = require("~/common/utils/helpers");
const permissions_1 = require("~/extension/background-script/permissions");
const state_1 = __importDefault(require("~/extension/background-script/state"));
const types_1 = require("~/types");
const nip44EncryptOrPrompt = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    const host = (0, helpers_1.getHostFromSender)(sender);
    if (!host)
        return;
    try {
        const hasPermission = yield (0, permissions_1.hasPermissionFor)(types_1.PermissionMethodNostr["NOSTR_ENCRYPT"], host);
        const isBlocked = yield (0, permissions_1.isPermissionBlocked)(types_1.PermissionMethodNostr["NOSTR_ENCRYPT"], host);
        if (isBlocked) {
            return { denied: true };
        }
        if (hasPermission) {
            return nip44Encrypt();
        }
        else {
            const promptResponse = yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "public/nostr/confirmEncrypt", args: {
                    encrypt: {
                        recipientNpub: nostr_1.default.hexToNip19(message.args.peer, "npub"),
                        message: message.args.plaintext,
                    },
                } }));
            // add permission to db only if user decided to always allow this request
            if (promptResponse.data.permissionOption == constants_1.DONT_ASK_CURRENT) {
                yield (0, permissions_1.addPermissionFor)(types_1.PermissionMethodNostr["NOSTR_ENCRYPT"], host, promptResponse.data.blocked);
            }
            if (promptResponse.data.permissionOption == constants_1.DONT_ASK_ANY) {
                Object.values(types_1.PermissionMethodNostr).forEach((permission) => __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, permissions_1.addPermissionFor)(permission, host, promptResponse.data.blocked);
                }));
            }
            if (promptResponse.data.confirm) {
                return nip44Encrypt();
            }
            else {
                return { error: constants_1.USER_REJECTED_ERROR };
            }
        }
    }
    catch (e) {
        console.error("encrypt failed", e);
        if (e instanceof Error) {
            return { error: e.message };
        }
    }
    function nip44Encrypt() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield state_1.default.getState().getNostr()).nip44Encrypt(message.args.peer, message.args.plaintext);
            return { data: response };
        });
    }
});
exports.default = nip44EncryptOrPrompt;
