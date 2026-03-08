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
const getById = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = message.args;
    const dbAllowance = yield db_1.default.allowances.get({ id });
    if (dbAllowance) {
        const allowance = Object.assign(Object.assign({}, dbAllowance), { id, payments: [], paymentsAmount: 0, paymentsCount: 0, percentage: 0, usedBudget: 0 });
        allowance.usedBudget =
            dbAllowance.totalBudget - dbAllowance.remainingBudget;
        allowance.percentage = dbAllowance.totalBudget
            ? (allowance.usedBudget / dbAllowance.totalBudget) * 100
            : 0;
        allowance.paymentsCount = yield db_1.default.payments
            .where("host")
            .equalsIgnoreCase(dbAllowance.host)
            .count();
        const dbPayments = yield db_1.default.payments
            .where("host")
            .equalsIgnoreCase(dbAllowance.host)
            .reverse()
            .toArray();
        allowance.payments = dbPayments.reduce((acc, dbPayment) => {
            if (!(dbPayment === null || dbPayment === void 0 ? void 0 : dbPayment.id))
                return acc;
            const { id } = dbPayment;
            acc.push(Object.assign(Object.assign({}, dbPayment), { id }));
            return acc;
        }, []);
        allowance.paymentsAmount = allowance.payments
            .map((payment) => {
            if (typeof payment.totalAmount === "string") {
                return parseInt(payment.totalAmount);
            }
            return payment.totalAmount;
        })
            .reduce((previous, current) => previous + current, 0);
        return {
            data: allowance,
        };
    }
    else {
        return { data: { enabled: false } };
    }
});
exports.default = getById;
