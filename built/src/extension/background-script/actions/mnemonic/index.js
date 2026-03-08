"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMnemonic = exports.getMnemonic = exports.generateMnemonic = void 0;
const generateMnemonic_1 = __importDefault(require("./generateMnemonic"));
exports.generateMnemonic = generateMnemonic_1.default;
const getMnemonic_1 = __importDefault(require("./getMnemonic"));
exports.getMnemonic = getMnemonic_1.default;
const setMnemonic_1 = __importDefault(require("./setMnemonic"));
exports.setMnemonic = setMnemonic_1.default;
