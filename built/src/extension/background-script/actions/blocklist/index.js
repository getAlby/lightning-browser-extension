"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlocklist = exports.list = exports.get = exports.add = void 0;
const add_1 = __importDefault(require("./add"));
exports.add = add_1.default;
const delete_1 = __importDefault(require("./delete"));
exports.deleteBlocklist = delete_1.default;
const get_1 = __importDefault(require("./get"));
exports.get = get_1.default;
const list_1 = __importDefault(require("./list"));
exports.list = list_1.default;
