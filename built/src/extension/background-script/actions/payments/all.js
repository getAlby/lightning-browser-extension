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
const all = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // TODO: Add pagination instead of limiting to 2121
    const limit = ((_a = message === null || message === void 0 ? void 0 : message.args) === null || _a === void 0 ? void 0 : _a.limit) || 2121;
    const payments = yield db_1.default.payments
        .toCollection()
        .limit(limit)
        .reverse()
        .sortBy("createdAt");
    return {
        data: {
            payments,
        },
    };
});
exports.default = all;
