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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const getSwapInfo = (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connector = yield state_1.default.getState().getConnector();
        if (!connector.getSwapInfo) {
            throw new Error("This connector does not support createSwap");
        }
        const data = yield connector.getSwapInfo();
        return {
            data,
        };
    }
    catch (e) {
        console.error(e);
        return {
            error: "Getting swap info failed: " + (e instanceof Error ? e.message : ""),
        };
    }
});
exports.default = getSwapInfo;
