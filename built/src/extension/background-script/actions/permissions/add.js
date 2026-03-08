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
const db_1 = __importDefault(require("../../db"));
const state_1 = __importDefault(require("../../state"));
const addPermission = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const { host, method, enabled, blocked } = message.args;
    const accountId = state_1.default.getState().currentAccountId;
    const matchingAllowance = yield db_1.default.allowances
        .where("host")
        .equalsIgnoreCase(host)
        .first();
    if (!(matchingAllowance === null || matchingAllowance === void 0 ? void 0 : matchingAllowance.id)) {
        return { error: "No Allowance set for this host" };
    }
    if (!accountId) {
        return { error: "No Account selected" };
    }
    const added = yield db_1.default.permissions.add({
        createdAt: Date.now().toString(),
        allowanceId: matchingAllowance.id,
        accountId,
        host,
        method,
        enabled,
        blocked,
    });
    yield db_1.default.saveToStorage();
    return { data: added };
});
exports.default = addPermission;
