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
const signPsbtWithPrompt = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const psbt = message.args.psbt;
    if (typeof psbt !== "string") {
        return {
            error: "PSBT missing.",
        };
    }
    try {
        const response = yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "webbtc/confirmSignPsbt" }));
        return response;
    }
    catch (e) {
        console.error("signPsbt cancelled", e);
        if (e instanceof Error) {
            return { error: e.message };
        }
    }
});
exports.default = signPsbtWithPrompt;
