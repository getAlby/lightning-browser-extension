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
const liquidjs_lib_1 = require("liquidjs-lib");
const state_1 = __importDefault(require("~/extension/background-script/state"));
const signPset = (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const psetBase64 = message.args.pset;
        if (!psetBase64 || typeof psetBase64 !== "string") {
            throw new Error("PSET missing");
        }
        const liquid = yield state_1.default.getState().getLiquid();
        const pset = liquidjs_lib_1.Pset.fromBase64(psetBase64);
        const signedPset = liquid.signPset(pset);
        return {
            data: {
                signed: signedPset.toBase64(),
            },
        };
    }
    catch (e) {
        console.error(e);
        return {
            error: "signPset failed: " + e,
        };
    }
});
exports.default = signPset;
