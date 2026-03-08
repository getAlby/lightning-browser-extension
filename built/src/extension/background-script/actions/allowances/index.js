"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAllowance = exports.list = exports.getById = exports.get = exports.deleteAllowance = exports.add = void 0;
const add_1 = __importDefault(require("./add"));
exports.add = add_1.default;
const delete_1 = __importDefault(require("./delete"));
exports.deleteAllowance = delete_1.default;
const get_1 = __importDefault(require("./get"));
exports.get = get_1.default;
const getById_1 = __importDefault(require("./getById"));
exports.getById = getById_1.default;
const list_1 = __importDefault(require("./list"));
exports.list = list_1.default;
const update_1 = __importDefault(require("./update"));
exports.updateAllowance = update_1.default;
