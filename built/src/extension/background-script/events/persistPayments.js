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
exports.persistSuccessfulPayment = void 0;
const db_1 = __importDefault(require("../db"));
const persistSuccessfulPayment = (message, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const name = (_a = data === null || data === void 0 ? void 0 : data.origin) === null || _a === void 0 ? void 0 : _a.name;
    const host = ((_b = data === null || data === void 0 ? void 0 : data.origin) === null || _b === void 0 ? void 0 : _b.host) || "";
    const location = (_c = data === null || data === void 0 ? void 0 : data.origin) === null || _c === void 0 ? void 0 : _c.location;
    const accountId = data.accountId;
    const paymentResponse = data.response;
    if ("error" in paymentResponse) {
        return;
    }
    const allowance = yield db_1.default.allowances
        .where("host")
        .equalsIgnoreCase(host)
        .first();
    const route = paymentResponse.data.route;
    const { total_amt, total_fees } = route;
    yield db_1.default.payments.add({
        accountId,
        host,
        location,
        name,
        description: data.details.description,
        preimage: paymentResponse.data.preimage,
        paymentHash: paymentResponse.data.paymentHash,
        destination: data.details.destination,
        totalAmount: total_amt,
        totalFees: total_fees,
        createdAt: Date.now().toString(),
        allowanceId: allowance ? ((_d = allowance.id) !== null && _d !== void 0 ? _d : "").toString() : "",
        paymentRequest: "",
    });
    yield db_1.default.saveToStorage();
    console.info(`Persisted payment ${paymentResponse.data.paymentHash}`);
    return true;
});
exports.persistSuccessfulPayment = persistSuccessfulPayment;
