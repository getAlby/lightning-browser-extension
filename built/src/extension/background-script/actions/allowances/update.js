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
const updateAllowance = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const id = message.args.id;
    if (!id)
        return { error: "id is missing" };
    const update = {};
    if (Object.prototype.hasOwnProperty.call(message.args, "totalBudget")) {
        update.totalBudget = message.args.totalBudget;
        update.remainingBudget = message.args.totalBudget;
    }
    if (Object.prototype.hasOwnProperty.call(message.args, "enabled")) {
        update.enabled = message.args.enabled;
    }
    if (Object.prototype.hasOwnProperty.call(message.args, "lnurlAuth")) {
        update.lnurlAuth = message.args.lnurlAuth;
    }
    const updated = yield db_1.default.allowances.update(id, update);
    yield db_1.default.saveToStorage();
    return { data: updated };
});
exports.default = updateAllowance;
