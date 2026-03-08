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
const helpers_1 = require("~/common/utils/helpers");
const db_1 = __importDefault(require("~/extension/background-script/db"));
const state_1 = __importDefault(require("../../state"));
const isEnabled = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    const host = (0, helpers_1.getHostFromSender)(sender);
    if (!host)
        return;
    const isUnlocked = yield state_1.default.getState().isUnlocked();
    const allowance = yield db_1.default.allowances
        .where("host")
        .equalsIgnoreCase(host)
        .first();
    const enabledFor = new Set(allowance === null || allowance === void 0 ? void 0 : allowance.enabledFor);
    if (isUnlocked && allowance && allowance.enabled && enabledFor.has("webln")) {
        return {
            data: { isEnabled: true },
        };
    }
    else {
        return {
            data: { isEnabled: false },
        };
    }
});
exports.default = isEnabled;
