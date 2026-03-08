"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listByAllowance = exports.deleteByIds = exports.deletePermission = exports.add = void 0;
const add_1 = __importDefault(require("./add"));
exports.add = add_1.default;
const delete_1 = __importDefault(require("./delete"));
exports.deletePermission = delete_1.default;
const deleteByIds_1 = __importDefault(require("./deleteByIds"));
exports.deleteByIds = deleteByIds_1.default;
const list_1 = __importDefault(require("./list"));
exports.listByAllowance = list_1.default;
