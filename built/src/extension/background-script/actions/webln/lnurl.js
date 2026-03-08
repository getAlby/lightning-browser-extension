"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lnurl_1 = __importDefault(require("../lnurl"));
/*
For now this is simple an alias for ../lnurl
But this function is called from webln. We can add certain permissions here later
*/
exports.default = lnurl_1.default;
