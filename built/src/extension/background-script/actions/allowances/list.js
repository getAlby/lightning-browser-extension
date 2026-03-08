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
const list = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const dbAllowances = yield db_1.default.allowances
        .toCollection()
        .reverse()
        .sortBy("lastPaymentAt");
    const allowances = [];
    for (const dbAllowance of dbAllowances) {
        if (dbAllowance.id) {
            const { id } = dbAllowance;
            const tmpAllowance = Object.assign(Object.assign({}, dbAllowance), { id, payments: [], paymentsAmount: 0, paymentsCount: 0, percentage: 0, usedBudget: 0 });
            tmpAllowance.usedBudget =
                tmpAllowance.totalBudget - tmpAllowance.remainingBudget;
            tmpAllowance.percentage = tmpAllowance.totalBudget
                ? (tmpAllowance.usedBudget / tmpAllowance.totalBudget) * 100
                : 0;
            tmpAllowance.paymentsCount = yield db_1.default.payments
                .where("host")
                .equalsIgnoreCase(tmpAllowance.host)
                .count();
            const payments = yield db_1.default.payments
                .where("host")
                .equalsIgnoreCase(tmpAllowance.host)
                .reverse()
                .toArray();
            tmpAllowance.paymentsAmount = payments
                .map((payment) => {
                if (typeof payment.totalAmount === "string") {
                    return parseInt(payment.totalAmount);
                }
                return payment.totalAmount;
            })
                .reduce((previous, current) => previous + current, 0);
            allowances.push(tmpAllowance);
        }
    }
    return {
        data: {
            allowances,
        },
    };
});
exports.default = list;
