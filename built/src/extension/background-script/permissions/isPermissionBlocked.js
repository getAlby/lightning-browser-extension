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
exports.isPermissionBlocked = void 0;
const db_1 = __importDefault(require("~/extension/background-script/db"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
function isPermissionBlocked(method, host) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!host) {
            return false;
        }
        const allowance = yield db_1.default.allowances
            .where("host")
            .equalsIgnoreCase(host)
            .first();
        if (!(allowance === null || allowance === void 0 ? void 0 : allowance.id)) {
            throw new Error("Could not find an allowance for this host");
        }
        const accountId = state_1.default.getState().currentAccountId;
        if (!accountId) {
            throw new Error("Account doesn't exist");
        }
        const findPermission = yield db_1.default.permissions.get({
            host,
            method,
            accountId,
        });
        return !!(findPermission === null || findPermission === void 0 ? void 0 : findPermission.blocked);
    });
}
exports.isPermissionBlocked = isPermissionBlocked;
