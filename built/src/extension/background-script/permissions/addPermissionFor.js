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
exports.addPermissionFor = void 0;
const db_1 = __importDefault(require("~/extension/background-script/db"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
function addPermissionFor(method, host, blocked) {
    return __awaiter(this, void 0, void 0, function* () {
        const accountId = state_1.default.getState().currentAccountId;
        const allowance = yield db_1.default.allowances.get({
            host,
        });
        if (!(allowance === null || allowance === void 0 ? void 0 : allowance.id) || !accountId) {
            return false;
        }
        const existingPermission = yield db_1.default.permissions
            .filter((x) => x.accountId === accountId &&
            x.allowanceId === allowance.id &&
            x.host === host &&
            x.method === method)
            .first();
        let affectedRows = 0;
        if (!existingPermission) {
            affectedRows = yield db_1.default.permissions.add({
                createdAt: Date.now().toString(),
                accountId: accountId,
                allowanceId: allowance.id,
                host: host,
                method: method,
                enabled: true,
                blocked: blocked,
            });
        }
        else {
            affectedRows = yield db_1.default.permissions.update(existingPermission.id, {
                enabled: true,
                blocked: blocked,
            });
        }
        return !!affectedRows && (yield db_1.default.saveToStorage());
    });
}
exports.addPermissionFor = addPermissionFor;
