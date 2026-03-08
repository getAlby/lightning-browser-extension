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
const db_1 = __importDefault(require("~/extension/background-script/db"));
const listByAllowance = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, accountId } = message.args;
    if (!accountId) {
        return {
            error: "Missing account id to fetch permissions.",
        };
    }
    const dbPermissions = yield db_1.default.permissions
        .where({ allowanceId: id, accountId })
        .toArray();
    const permissions = [];
    for (const dbPermission of dbPermissions) {
        if (dbPermission.id) {
            const { id } = dbPermission;
            const tmpPermission = Object.assign(Object.assign({}, dbPermission), { id });
            permissions.push(tmpPermission);
        }
    }
    return {
        data: {
            permissions,
        },
    };
});
exports.default = listByAllowance;
