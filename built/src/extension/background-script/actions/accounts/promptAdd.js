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
function promptAddAccount(message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof message.args.name !== "string") {
            return {
                error: "Name missing.",
            };
        }
        if (typeof message.args.connector !== "string") {
            return {
                error: "Connector missing.",
            };
        }
        if (typeof message.args.config !== "object") {
            return {
                error: "Config missing.",
            };
        }
        try {
            yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "confirmAddAccount" }));
            return { data: { success: true } };
        }
        catch (e) {
            console.error("Adding account cancelled", e);
            if (e instanceof Error) {
                return { success: false, error: e.message };
            }
            return { success: false };
        }
    });
}
exports.default = promptAddAccount;
