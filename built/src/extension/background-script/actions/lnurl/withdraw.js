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
const utils_1 = __importDefault(require("../../../../common/lib/utils"));
function withdrawWithPrompt(message, lnurlDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield utils_1.default.openPrompt({
                origin: message.origin,
                action: "lnurlWithdraw",
                args: Object.assign(Object.assign({}, message.args), { lnurlDetails }),
            });
            return response; // response is an object like: `{ data: ... }`
        }
        catch (e) {
            return { error: e instanceof Error ? e.message : e };
        }
    });
}
exports.default = withdrawWithPrompt;
