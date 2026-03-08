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
const signPsetWithPrompt = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const pset = message.args.pset;
    if (!pset || typeof pset !== "string") {
        return {
            error: "PSET missing.",
        };
    }
    try {
        const response = yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "public/liquid/confirmSignPset" }));
        return response;
    }
    catch (e) {
        console.error("signPset cancelled", e);
        if (e instanceof Error) {
            return { error: e.message };
        }
    }
});
exports.default = signPsetWithPrompt;
