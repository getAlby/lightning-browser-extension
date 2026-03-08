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
const deleteBlocklist = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const host = message.args.host;
    const blocklist = yield db_1.default.blocklist
        .where("host")
        .equalsIgnoreCase(host)
        .first();
    if (blocklist === null || blocklist === void 0 ? void 0 : blocklist.id) {
        yield db_1.default.blocklist.delete(blocklist.id);
        yield db_1.default.saveToStorage();
    }
    return { data: true };
});
exports.default = deleteBlocklist;
