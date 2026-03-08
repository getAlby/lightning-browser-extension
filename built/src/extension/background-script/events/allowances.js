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
exports.updateAllowance = void 0;
const db_1 = __importDefault(require("../db"));
const updateAllowance = (message, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.origin || !data.origin.host) {
        return;
    }
    const host = data.origin.host;
    const paymentResponse = data.response;
    if ("error" in paymentResponse) {
        return;
    }
    const route = paymentResponse.data.route;
    const { total_amt } = route;
    const allowance = yield db_1.default.allowances
        .where("host")
        .equalsIgnoreCase(host)
        .first();
    if (!allowance || !allowance.id) {
        return;
    }
    const remainingBudget = allowance.remainingBudget || 0; // remainingBudget might be blank
    const newRemaining = Math.max(remainingBudget - total_amt, 0); // no negative values
    yield db_1.default.allowances.update(allowance.id, {
        remainingBudget: newRemaining,
        lastPaymentAt: Date.now(),
    });
    yield db_1.default.saveToStorage();
    return true;
});
exports.updateAllowance = updateAllowance;
